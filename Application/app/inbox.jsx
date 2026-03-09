import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import GlowBackground from "../src/components/GlowBackground";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import useApi from "../src/services/useApi";
import { messagesApi as messagesApiFactory } from "../src/services/messagesApi";
import { AuthContext } from "../src/context/auth.context";

export default function Inbox() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const router = useRouter();
  const api = useApi();
  const messagesApi = useMemo(() => messagesApiFactory(api), [api]);
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const currentUserId = Number(user?.id);

  const loadInbox = useCallback(
    async (silent = false) => {
      try {
        if (silent) setRefreshing(true);
        else setLoading(true);

        setErr("");
        const res = await messagesApi.getInbox();
        setItems(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.error || "Failed to load inbox");
      } finally {
        if (silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [messagesApi],
  );

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

  const confirmDelete = (userId) => {
    Alert.alert(
      "Delete Conversation",
      "This chat will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messagesApi.deleteConversation(userId);
              setItems((prev) =>
                prev.filter((item) => Number(item.user?.id) !== Number(userId)),
              );
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.error || "Failed to delete conversation",
              );
            }
          },
        },
      ],
    );
  };

  const renderList = (list, unreadStyle = false) =>
    list.map((item, i) => {
      const other = item.user;
      const last = item.lastMessage;

      return (
        <View
          key={other?.id || i}
          style={[styles.itemCard, unreadStyle && styles.unreadCard]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{other?.username || "-"}</Text>
            <Text style={styles.itemSub}>Role: {other?.role || "-"}</Text>
            <Text style={styles.itemText} numberOfLines={1}>
              {last?.text || "-"}
            </Text>
            <Text style={styles.itemTime}>
              {last?.createdAt
                ? new Date(last.createdAt).toLocaleString()
                : "-"}
            </Text>
          </View>

          <View style={styles.actionsCol}>
            <Pressable
              style={styles.openBtn}
              onPress={() => router.push(`/chat/${other.id}`)}
            >
              <Text style={styles.btnText}>Open Chat</Text>
            </Pressable>

            <Pressable
              style={styles.deleteBtn}
              onPress={() => confirmDelete(other.id)}
            >
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      );
    });

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>Inbox</Text>
            <Text style={styles.sub}>Your conversations</Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={() => loadInbox(true)}>
            <Text style={styles.btnText}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </Text>
          </Pressable>
        </View>

        {!loading && !err && items.length > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.pill}>Total: {items.length}</Text>
            <Text style={styles.pill}>Unread: {unread.length}</Text>
            <Text style={styles.pill}>Read: {read.length}</Text>
          </View>
        )}

        {loading && <Text style={styles.info}>Loading...</Text>}
        {!!err && <Text style={styles.err}>{err}</Text>}

        {!loading && !err && items.length === 0 && (
          <Text style={styles.info}>No conversations yet.</Text>
        )}

        {!loading && !err && (
          <ScrollView style={{ marginTop: 12 }}>
            {unread.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Unread ({unread.length})
                </Text>
                {renderList(unread, true)}
              </>
            )}

            {read.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Read ({read.length})</Text>
                {renderList(read)}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "white", fontSize: 26, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6 },
  refreshBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  pill: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 8,
  },
  itemCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: "rgba(124,255,178,0.06)",
  },
  itemTitle: { color: "white", fontWeight: "900", fontSize: 16 },
  itemSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  itemText: { color: "white", marginTop: 6 },
  itemTime: { color: "rgba(255,255,255,0.6)", marginTop: 6, fontSize: 12 },
  actionsCol: {
    justifyContent: "center",
    gap: 8,
  },
  openBtn: {
    minWidth: 100,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  deleteBtn: {
    minWidth: 100,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 107, 107, 0.85)",
  },
  btnText: { color: "white", fontWeight: "900" },
  info: { color: "white", marginTop: 14 },
  err: { color: "#ff6b6b", marginTop: 14, fontWeight: "900" },
});
