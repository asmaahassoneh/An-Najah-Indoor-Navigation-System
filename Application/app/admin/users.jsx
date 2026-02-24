import { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import AdminRoute from "../../src/routes/AdminRoute";
import useApi from "../../src/services/useApi";
import GlowBackground from "../../src/components/GlowBackground";

export default function AdminUsers() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const api = useApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete user",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/users/id/${id}`);
              setUsers((prev) => prev.filter((u) => u.id !== id));
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.error || "Failed to delete user",
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Users</Text>
            <Text style={styles.sub}>Manage all users</Text>
          </View>

          <Pressable onPress={fetchUsers} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>Refresh</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {loading && <Text style={{ color: "white" }}>Loading...</Text>}
          {!!err && <Text style={styles.err}>{err}</Text>}

          {!loading && !err && (
            <ScrollView style={{ marginTop: 10 }}>
              {users.map((u) => (
                <View key={u.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {u.username} (#{u.id})
                    </Text>
                    <Text style={styles.rowSub}>{u.email}</Text>
                    <Text style={styles.rowSub}>
                      Role: {u.role} • Room: {u.roomCode ?? "-"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => confirmDelete(u.id)}
                    style={styles.dangerBtn}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </Pressable>
                </View>
              ))}

              {users.length === 0 && (
                <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  No users found.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "white", fontSize: 24, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6 },

  card: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    flex: 1,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  rowTitle: { color: "white", fontWeight: "900" },
  rowSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },

  dangerBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 107, 107, 0.85)",
  },
  btnText: { color: "white", fontWeight: "900" },

  smallBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  smallBtnText: { color: "white", fontWeight: "900" },

  err: { color: "#ff6b6b", fontWeight: "900" },
});
