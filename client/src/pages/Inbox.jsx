import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { AuthContext } from "../context/auth.context";
import { useNavigate } from "react-router-dom";
import { messagesApi } from "../services/messagesApi";

export default function Inbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const { user } = useContext(AuthContext);
  const currentUserId = Number(user?.id);

  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteChat = async (otherUserId) => {
    try {
      await messagesApi.deleteConversation(otherUserId);

      setItems((prev) =>
        prev.filter((item) => Number(item.user?.id) !== Number(otherUserId)),
      );

      setDeleteTarget(null);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete conversation");
    }
  };

  const loadInbox = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErr("");
      const res = await messagesApi.getInbox();
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load inbox");
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadInbox(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadInbox]);

  const isUnreadConversation = useCallback(
    (item) => {
      const last = item?.lastMessage;
      if (!last) return false;

      return !last.isRead && Number(last.receiverId) === currentUserId;
    },
    [currentUserId],
  );

  const unread = useMemo(
    () => items.filter((item) => isUnreadConversation(item)),
    [items, isUnreadConversation],
  );

  const read = useMemo(
    () => items.filter((item) => !isUnreadConversation(item)),
    [items, isUnreadConversation],
  );

  const renderRows = (list, unreadStyle = false) =>
    list.map((item, i) => {
      const other = item.user;
      const last = item.lastMessage;

      return (
        <tr
          key={other?.id || i}
          style={
            unreadStyle
              ? {
                  background: "rgba(124,255,178,0.06)",
                }
              : undefined
          }
        >
          <td style={{ fontWeight: unreadStyle ? 700 : 500 }}>
            {other?.username || "-"}
          </td>
          <td>{other?.role || "-"}</td>
          <td
            style={{
              fontWeight: unreadStyle ? 700 : 400,
              maxWidth: 280,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={last?.text || ""}
          >
            {last?.text || "-"}
          </td>
          <td>
            {last?.createdAt ? new Date(last.createdAt).toLocaleString() : "-"}
          </td>
          <td style={{ display: "flex", gap: "8px" }}>
            <button
              className="scheduleNavBtn"
              onClick={() => navigate(`/chat/${other.id}`)}
            >
              Open Chat
            </button>

            <button
              className="delete-btn-inbox"
              onClick={() => setDeleteTarget(other.id)}
            >
              Delete
            </button>
          </td>
        </tr>
      );
    });

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Messages</div>
            <h2 className="scheduleTitle">Inbox</h2>
          </div>

          <button
            className="authBtn authBtnSecondary scheduleBtn"
            onClick={() => loadInbox(true)}
            disabled={refreshing}
            style={{ position: "relative", top: "-15px" }}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {!loading && !err && items.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <span className="navPill">Total: {items.length}</span>
            <span className="navPill">Unread: {unread.length}</span>
            <span className="navPill">Read: {read.length}</span>
          </div>
        )}

        {loading && <p className="authMsg">Loading...</p>}
        {!!err && <p className="authMsg authErr">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <p className="authMsg">No conversations yet.</p>
        )}

        {!loading && !err && unread.length > 0 && (
          <>
            <h3 style={{ marginBottom: 10 }}>Unread ({unread.length})</h3>
            <div className="scheduleTableWrap" style={{ marginBottom: 20 }}>
              <table className="scheduleTable">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Last Message</th>
                    <th>Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{renderRows(unread, true)}</tbody>
              </table>
            </div>
          </>
        )}

        {!loading && !err && read.length > 0 && (
          <>
            <h3 style={{ marginBottom: 10 }}>Read ({read.length})</h3>
            <div className="scheduleTableWrap">
              <table className="scheduleTable">
                <thead>
                  <tr>
                    <th>
                      {user?.role === "student" ? "Professor" : "Student"}
                    </th>
                    <th>Role</th>
                    <th>Last Message</th>
                    <th>Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{renderRows(read)}</tbody>
              </table>
            </div>
          </>
        )}

        {deleteTarget && (
          <div className="confirmOverlay">
            <div className="confirmCard">
              <h3>Delete Conversation</h3>
              <p>This chat will be permanently deleted.</p>

              <div className="confirmActions">
                <button
                  className="authBtn authBtnSecondary"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>

                <button
                  className="deleteChatBtn"
                  onClick={() => deleteChat(deleteTarget)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
