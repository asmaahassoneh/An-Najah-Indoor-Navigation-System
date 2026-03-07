import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { messagesApi } from "../services/messagesApi";
import API from "../services/api";

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const currentUserId = useMemo(() => Number(user?.id), [user]);
  const otherUserId = useMemo(() => Number(userId), [userId]);

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const [convRes, otherRes] = await Promise.all([
        messagesApi.getConversation(otherUserId),
        API.get(`/users/chat-user/${otherUserId}`),
      ]);

      const list = convRes.data || [];
      setMessages(list);
      setOtherUser(otherRes.data || null);

      await messagesApi.markRead(otherUserId);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const send = async (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    try {
      setSending(true);
      setErr("");

      await messagesApi.sendMessage({
        receiverId: otherUserId,
        text: clean,
      });

      setText("");
      await loadConversation();
    } catch (e2) {
      setErr(e2.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Chat</div>
            <h2 className="scheduleTitle">
              {otherUser ? `Chat with ${otherUser.username}` : "Conversation"}
            </h2>
            <p className="authSub">
              {otherUser ? `Role: ${otherUser.role}` : "Loading user..."}
            </p>
          </div>

          <button
            className="authBtn authBtnSecondary scheduleBtn"
            onClick={() => navigate("/inbox")}
          >
            Back to Inbox
          </button>
        </div>

        {loading && <p className="authMsg">Loading...</p>}
        {!!err && <p className="authMsg authErr">{err}</p>}

        {!loading && (
          <>
            <div
              style={{
                maxHeight: "420px",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "14px",
                display: "grid",
                gap: "10px",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {messages.length === 0 && (
                <p className="authMsg">No messages yet. Start the chat.</p>
              )}

              {messages.map((msg) => {
                const mine = Number(msg.senderId) === currentUserId;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "10px 14px",
                        borderRadius: "14px",
                        background: mine
                          ? "rgba(124,255,178,0.16)"
                          : "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.7,
                          marginBottom: 6,
                        }}
                      >
                        {mine
                          ? "You"
                          : (msg.sender?.username ??
                            otherUser?.username ??
                            "User")}
                      </div>

                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.6,
                          marginTop: 6,
                        }}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={send}
              style={{ marginTop: 16, display: "grid", gap: 12 }}
            >
              <textarea
                className="importTextarea"
                rows={4}
                placeholder="Write a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="authBtn authBtnEnter"
                  type="submit"
                  disabled={sending}
                >
                  <span className="btnShine" />
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
