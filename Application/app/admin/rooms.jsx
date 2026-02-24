import { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import AdminRoute from "../../src/routes/AdminRoute";
import useApi from "../../src/services/useApi";
import GlowBackground from "../../src/components/GlowBackground";

export default function AdminRooms() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const api = useApi();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [roomForm, setRoomForm] = useState({ code: "", type: "lecture" });
  const [roomMsg, setRoomMsg] = useState("");

  const fetchRooms = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/rooms");
      setRooms(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async () => {
    setRoomMsg("");
    try {
      await api.post("/rooms", roomForm);
      setRoomMsg("Room Added ✅");
      setRoomForm({ code: "", type: "lecture" });
      fetchRooms();
    } catch (e) {
      setRoomMsg(e.response?.data?.error || "Failed to add room");
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete room",
      "Are you sure you want to delete this room?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/rooms/id/${id}`);
              setRooms((prev) => prev.filter((r) => r.id !== id));
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.error || "Failed to delete room",
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
            <Text style={styles.title}>Rooms</Text>
            <Text style={styles.sub}>Create and manage rooms</Text>
          </View>

          <Pressable onPress={fetchRooms} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>Refresh</Text>
          </Pressable>
        </View>

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
            placeholder="type: lecture / lab / office ..."
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
                marginTop: 10,
              }}
            >
              {roomMsg}
            </Text>
          )}
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>All Rooms</Text>

          {loading && <Text style={{ color: "white" }}>Loading...</Text>}
          {!!err && <Text style={styles.err}>{err}</Text>}

          {!loading && !err && (
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
                    onPress={() => confirmDelete(r.id)}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 18, gap: 14 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { color: "white", fontSize: 24, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6 },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
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

  err: { color: "#ff6b6b", fontWeight: "900", marginTop: 10 },
});
