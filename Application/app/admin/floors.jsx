import { useEffect, useState } from "react";
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
import GlowBackground from "../../src/components/GlowBackground";
import AdminRoute from "../../src/routes/AdminRoute";
import useApi from "../../src/services/useApi";

function normalizeKey(v) {
  return String(v || "")
    .trim()
    .toUpperCase();
}

function isCompleteFloorKey(key) {
  const k = normalizeKey(key);
  return (
    k === "G" ||
    k === "GF" ||
    /^B\d+$/.test(k) ||
    /^F\d+$/.test(k) ||
    /^\d+$/.test(k)
  );
}

function guessFloorName(key) {
  const k = normalizeKey(key);
  if (k === "GF" || k === "G") return "Ground Floor";
  if (/^B\d+$/.test(k)) return `Basement ${k.slice(1)}`;
  if (/^F\d+$/.test(k)) return `Floor ${k.slice(1)}`;
  if (/^\d+$/.test(k)) return `Floor ${k}`;
  return "";
}

function guessFloorImageUrl(key) {
  const k = normalizeKey(key);
  if (!isCompleteFloorKey(k)) return "";
  return `/maps/Eng${k}.jpg`;
}

export default function AdminFloors() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const api = useApi();

  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    key: "",
    name: "",
    faculty: "Engineering",
    imageUrl: "",
    width: "1270",
    height: "800",
    _autoName: true,
    _autoImg: true,
  });

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/maps/floors");
      setFloors(res.data || []);
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to load floors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  });

  const createFloor = async () => {
    try {
      setMsg("");
      await api.post("/maps/floors", {
        ...form,
        width: Number(form.width),
        height: Number(form.height),
      });

      setMsg("Floor added ✅");
      setForm({
        key: "",
        name: "",
        faculty: "Engineering",
        imageUrl: "",
        width: "1270",
        height: "800",
        _autoName: true,
        _autoImg: true,
      });
      fetchFloors();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to create floor");
    }
  };

  const deleteFloor = (id) => {
    Alert.alert(
      "Delete Floor",
      "Delete this floor and ALL its nodes, edges, and rooms?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/maps/floors/${id}`);
              setMsg("Floor deleted ✅");
              fetchFloors();
            } catch (e) {
              setMsg(e.response?.data?.error || "Failed to delete floor");
            }
          },
        },
      ],
    );
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Manage Floors</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Floor Key (GF, B1, B2, 1...)"
            placeholderTextColor="#cbd5f5"
            value={form.key}
            onChangeText={(v) => {
              const key = normalizeKey(v);
              setForm((p) => {
                const complete = isCompleteFloorKey(key);
                return {
                  ...p,
                  key,
                  name: complete && p._autoName ? guessFloorName(key) : p.name,
                  imageUrl:
                    complete && p._autoImg
                      ? guessFloorImageUrl(key)
                      : p.imageUrl,
                };
              });
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Floor Name"
            placeholderTextColor="#cbd5f5"
            value={form.name}
            onChangeText={(v) =>
              setForm((p) => ({ ...p, name: v, _autoName: false }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Faculty"
            placeholderTextColor="#cbd5f5"
            value={form.faculty}
            onChangeText={(v) => setForm((p) => ({ ...p, faculty: v }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Image URL"
            placeholderTextColor="#cbd5f5"
            value={form.imageUrl}
            onChangeText={(v) =>
              setForm((p) => ({ ...p, imageUrl: v, _autoImg: false }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Width"
            placeholderTextColor="#cbd5f5"
            value={form.width}
            onChangeText={(v) => setForm((p) => ({ ...p, width: v }))}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Height"
            placeholderTextColor="#cbd5f5"
            value={form.height}
            onChangeText={(v) => setForm((p) => ({ ...p, height: v }))}
            keyboardType="numeric"
          />

          <Pressable style={styles.primaryBtn} onPress={createFloor}>
            <Text style={styles.btnText}>Add Floor</Text>
          </Pressable>

          {!!msg && (
            <Text
              style={{
                color: msg.includes("✅") ? "#4ade80" : "#ff6b6b",
                marginTop: 10,
                fontWeight: "900",
              }}
            >
              {msg}
            </Text>
          )}
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          {loading && <Text style={{ color: "white" }}>Loading...</Text>}

          {!loading && (
            <ScrollView style={{ marginTop: 10 }}>
              {floors.map((f) => (
                <View key={f.id} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {f.key} — {f.name}
                    </Text>
                    <Text style={styles.rowSub}>Faculty: {f.faculty}</Text>
                    <Text style={styles.rowSub}>Image: {f.imageUrl}</Text>
                    <Text style={styles.rowSub}>
                      Size: {f.width} × {f.height}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.dangerBtn}
                    onPress={() => deleteFloor(f.id)}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </Pressable>
                </View>
              ))}

              {floors.length === 0 && (
                <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                  No floors found.
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
  title: { color: "white", fontSize: 24, fontWeight: "900" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    color: "white",
    marginBottom: 10,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
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
});
