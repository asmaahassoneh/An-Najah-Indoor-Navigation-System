import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import GlowBackground from "../../src/components/GlowBackground";
import ProtectedRoute from "../../src/routes/ProtectedRoute";
import useApi from "../../src/services/useApi";
import { messagesApi as messagesApiFactory } from "../../src/services/messagesApi";
import { AuthContext } from "../../src/context/auth.context";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const api = useApi();
  const messagesApi = useMemo(() => messagesApiFactory(api), [api]);
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
        api.get(`/users/chat-user/${otherUserId}`),
      ]);

      setMessages(convRes.data || []);
      setOtherUser(otherRes.data || null);

      await messagesApi.markRead(otherUserId);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [messagesApi, otherUserId, api]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const send = async () => {
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
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {otherUser ? `Chat with ${otherUser.username}` : "Conversation"}
            </Text>
            <Text style={styles.sub}>
              {otherUser ? otherUser.role : "Loading user..."}
            </Text>
          </View>

          <Pressable
            style={styles.backBtn}
            onPress={() => router.push("/inbox")}
          >
            <Text style={styles.btnText}>Back</Text>
          </Pressable>
        </View>

        {loading && <Text style={styles.info}>Loading...</Text>}
        {!!err && <Text style={styles.err}>{err}</Text>}

        {!loading && (
          <>
            <ScrollView style={styles.messagesBox}>
              {messages.length === 0 && (
                <Text style={styles.info}>
                  No messages yet. Start the chat.
                </Text>
              )}

              {messages.map((msg) => {
                const mine = Number(msg.senderId) === currentUserId;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.row,
                      mine ? styles.rowMine : styles.rowTheirs,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        mine ? styles.bubbleMine : styles.bubbleTheirs,
                      ]}
                    >
                      <Text style={styles.sender}>
                        {mine
                          ? "You"
                          : (msg.sender?.username ??
                            otherUser?.username ??
                            "User")}
                      </Text>

                      <Text style={styles.messageText}>{msg.text}</Text>

                      <Text style={styles.time}>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : ""}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.form}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write a message..."
                placeholderTextColor="#cbd5f5"
                multiline
                style={styles.textarea}
              />

              <Pressable
                style={[styles.sendBtn, sending && { opacity: 0.7 }]}
                onPress={send}
                disabled={sending}
              >
                <Text style={styles.btnText}>
                  {sending ? "Sending..." : "Send"}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: { color: "white", fontSize: 24, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  backBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  messagesBox: {
    flex: 1,
    marginBottom: 12,
  },
  row: {
    marginBottom: 10,
    flexDirection: "row",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
  },
  bubbleMine: {
    backgroundColor: "#8f5cff",
  },
  bubbleTheirs: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sender: {
    color: "white",
    fontWeight: "900",
    marginBottom: 6,
  },
  messageText: {
    color: "white",
  },
  time: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    fontSize: 11,
  },
  form: {
    gap: 10,
    paddingBottom: 16,
  },
  textarea: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 12,
    color: "white",
    textAlignVertical: "top",
  },
  sendBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  btnText: { color: "white", fontWeight: "900" },
  info: { color: "white", marginTop: 12 },
  err: { color: "#ff6b6b", marginTop: 12, fontWeight: "900" },
});
