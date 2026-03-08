import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { messagesApi } from "../services/messagesApi";
import API from "../services/api";
import "../styles/chat.css";

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
    <div className="authPage chatPageShell">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard chatCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Chat</div>
            <h2 className="scheduleTitle">
              {otherUser ? `Chat with ${otherUser.username}` : "Conversation"}
            </h2>
            <p className="authSub">
              {otherUser ? ` ${otherUser.role}` : "Loading user..."}
            </p>
          </div>

          <button
            className="authBtn authBtnSecondary scheduleBtn"
            onClick={() => navigate("/inbox")}
            style={{ position: "relative", top: "-20px" }}
          >
            Back to Inbox
          </button>
        </div>

        {loading && <p className="authMsg">Loading...</p>}
        {!!err && <p className="authMsg authErr">{err}</p>}

        {!loading && (
          <div className="chatMain">
            <div className="chatMessagesBox">
              {messages.length === 0 && (
                <p className="authMsg">No messages yet. Start the chat.</p>
              )}

              {messages.map((msg) => {
                const mine = Number(msg.senderId) === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`chatRow ${mine ? "mine" : "theirs"}`}
                  >
                    <div className={`chatBubble ${mine ? "mine" : "theirs"}`}>
                      <div className="chatSender">
                        {mine
                          ? "You"
                          : (msg.sender?.username ??
                            otherUser?.username ??
                            "User")}
                      </div>

                      <div className="chatText">{msg.text}</div>

                      <div className="chatTime">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={send} className="chatForm">
              <textarea
                className="chatTextarea importTextarea"
                rows={2}
                placeholder="Write a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="chatActions">
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
          </div>
        )}
      </div>
    </div>
  );
}
