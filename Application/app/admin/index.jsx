import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import AdminRoute from "../../src/routes/AdminRoute";
import useApi from "../../src/services/useApi";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const api = useApi();
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  const [roomForm, setRoomForm] = useState({ code: "", type: "lecture" });
  const [roomMsg, setRoomMsg] = useState("");

  const [confirmBox, setConfirmBox] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirm = ({ title, message, onConfirm }) =>
    setConfirmBox({ open: true, title, message, onConfirm });

  const closeConfirm = () =>
    setConfirmBox({ open: false, title: "", message: "", onConfirm: null });

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setUsersError(e.response?.data?.error || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [api]);

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    setRoomsError("");
    try {
      const res = await api.get("/rooms");
      setRooms(res.data || []);
    } catch (e) {
      setRoomsError(e.response?.data?.error || "Failed to load rooms");
    } finally {
      setRoomsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
    fetchRooms();
  }, [fetchUsers, fetchRooms]);

  const deleteUser = (id) => {
    openConfirm({
      title: "Delete user",
      message: "Are you sure you want to delete this user?",
      onConfirm: async () => {
        try {
          await api.delete(`/users/id/${id}`);
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (e) {
          alert(e.response?.data?.error || "Failed to delete user");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const deleteRoom = (id) => {
    openConfirm({
      title: "Delete room",
      message: "Are you sure you want to delete this room?",
      onConfirm: async () => {
        try {
          await api.delete(`/rooms/id/${id}`);
          setRooms((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
          alert(e.response?.data?.error || "Failed to delete room");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const createRoom = async () => {
    setRoomMsg("");
    try {
      await api.post("/rooms", roomForm);
      setRoomMsg("Room Added ✅");
      setRoomForm({ code: "", type: "lecture" });
      fetchRooms();
    } catch (e) {
      setRoomMsg(e.response?.data?.error || "Failed to Add room");
    }
  };

  const tabBtnStyle = useMemo(
    () => (active) => [
      styles.tabBtn,
      { backgroundColor: active ? "#8f5cff" : "rgba(255,255,255,0.06)" },
    ],
    [],
  );

  return (
    <Screen padded={false}>
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.sub}>Manage users and rooms</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => setTab("users")}
              style={tabBtnStyle(tab === "users")}
            >
              <Text style={styles.tabText}>Users</Text>
            </Pressable>
            <Pressable
              onPress={() => setTab("rooms")}
              style={tabBtnStyle(tab === "rooms")}
            >
              <Text style={styles.tabText}>Rooms</Text>
            </Pressable>
          </View>
        </View>

        {tab === "users" && (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>All Users</Text>
              <Pressable onPress={fetchUsers} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>Refresh</Text>
              </Pressable>
            </View>

            {usersLoading && <Text style={{ color: "white" }}>Loading...</Text>}
            {!!usersError && (
              <Text style={{ color: "#ff6b6b", fontWeight: "900" }}>
                {usersError}
              </Text>
            )}

            {!usersLoading && !usersError && (
              <ScrollView style={{ marginTop: 10 }}>
                {users.map((u) => (
                  <View key={u.id} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {u.username} (#{u.id})
                      </Text>
                      <Text style={styles.rowSub}>{u.email}</Text>
                      <Text style={styles.rowSub}>
                        Role: {u.role} • RoomId: {u.roomId ?? "-"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteUser(u.id)}
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
        )}

        {tab === "rooms" && (
          <View style={{ gap: 14 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add Room</Text>

              <TextInput
                value={roomForm.code}
                onChangeText={(v) => setRoomForm((p) => ({ ...p, code: v }))}
                placeholder="e.g. 11GF170"
                placeholderTextColor="#cbd5f5"
                style={styles.input}
              />

              <TextInput
                value={roomForm.type}
                onChangeText={(v) => setRoomForm((p) => ({ ...p, type: v }))}
                placeholder="type: lecture / lab / office / bathroom / other"
                placeholderTextColor="#cbd5f5"
                style={styles.input}
              />

              <Pressable onPress={createRoom} style={styles.primaryBtn}>
                <Text style={styles.btnText}>Add</Text>
              </Pressable>

              {!!roomMsg && (
                <Text
                  style={{
                    color: roomMsg.includes("✅") ? "#4ade80" : "#ff6b6b",
                    fontWeight: "900",
                    marginTop: 6,
                  }}
                >
                  {roomMsg}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>All Rooms</Text>
                <Pressable onPress={fetchRooms} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>Refresh</Text>
                </Pressable>
              </View>

              {roomsLoading && (
                <Text style={{ color: "white" }}>Loading...</Text>
              )}
              {!!roomsError && (
                <Text style={{ color: "#ff6b6b", fontWeight: "900" }}>
                  {roomsError}
                </Text>
              )}

              {!roomsLoading && !roomsError && (
                <ScrollView style={{ marginTop: 10 }}>
                  {rooms.map((r) => (
                    <View key={r.id} style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>
                          {r.code} (#{r.id})
                        </Text>
                        <Text style={styles.rowSub}>Type: {r.type}</Text>
                        <Text style={styles.rowSub}>
                          Floor: {r.floor ?? "-"} • Faculty: {r.faculty ?? "-"}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => deleteRoom(r.id)}
                        style={styles.dangerBtn}
                      >
                        <Text style={styles.btnText}>Delete</Text>
                      </Pressable>
                    </View>
                  ))}

                  {rooms.length === 0 && (
                    <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                      No rooms found.
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        <Modal
          visible={confirmBox.open}
          transparent
          animationType="fade"
          onRequestClose={closeConfirm}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{confirmBox.title}</Text>
              <Text style={styles.modalMsg}>{confirmBox.message}</Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <Pressable onPress={closeConfirm} style={styles.smallBtn}>
                  <Text style={styles.smallBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmBox.onConfirm}
                  style={styles.dangerBtn}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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

  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  tabText: { color: "white", fontWeight: "900" },

  card: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "900" },

  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    color: "white",
    marginTop: 10,
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

  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
    marginTop: 10,
  },
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(20,20,30,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { color: "white", fontWeight: "900", fontSize: 18 },
  modalMsg: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 10,
    marginBottom: 16,
  },
});
