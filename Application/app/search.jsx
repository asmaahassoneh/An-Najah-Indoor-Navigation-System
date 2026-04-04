import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import GlowBackground from "../src/components/GlowBackground";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import useApi from "../src/services/useApi";
import { mapsApi as mapsApiFactory } from "../src/services/mapsApi";

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const router = useRouter();
  const api = useApi();
  const mapsApi = useMemo(() => mapsApiFactory(api), [api]);

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [err, setErr] = useState("");

  const search = async () => {
    const clean = q.trim();
    if (!clean) {
      setItems([]);
      setSelected(null);
      return;
    }

    try {
      setLoading(true);
      setErr("");
      setSelected(null);

      const res = await mapsApi.searchRooms(clean);
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to search rooms");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (roomCode) => {
    try {
      setDetailsLoading(true);
      setErr("");
      const res = await mapsApi.roomDetails(roomCode);
      setSelected(res.data || null);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load room details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Search Rooms</Text>
        <Text style={styles.sub}>
          Search for lecture rooms, labs, and professor offices
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Enter room code..."
            placeholderTextColor="#cbd5f5"
            style={styles.input}
            onSubmitEditing={search}
          />

          <Pressable style={styles.searchBtn} onPress={search}>
            <Text style={styles.btnText}>Search</Text>
          </Pressable>
        </View>

        {loading && <Text style={styles.info}>Searching...</Text>}
        {!!err && <Text style={styles.err}>{err}</Text>}

        <ScrollView
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {items.map((item, i) => (
            <View key={item.id || item.roomCode || i} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomTitle}>{item.roomCode}</Text>
                <Text style={styles.meta}>
                  {item.name || item.type || "Room"}
                </Text>
                {!!item.floor?.name && (
                  <Text style={styles.meta}>Floor: {item.floor.name}</Text>
                )}
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.smallBtn, styles.secondaryBtn]}
                  onPress={() => openDetails(item.roomCode)}
                >
                  <Text style={styles.btnText}>Details</Text>
                </Pressable>

                <Pressable
                  style={styles.smallBtn}
                  onPress={() => router.push(`/navigate/${item.roomCode}`)}
                >
                  <Text style={styles.btnText}>Navigate</Text>
                </Pressable>
              </View>
            </View>
          ))}

          {!loading && !err && q.trim() && items.length === 0 && (
            <Text style={styles.info}>No rooms found.</Text>
          )}

          {detailsLoading && (
            <Text style={styles.info}>Loading details...</Text>
          )}

          {selected && (
            <View style={[styles.card, { marginTop: 8 }]}>
              <Text style={styles.roomTitle}>{selected.roomCode}</Text>
              <Text style={styles.meta}>Type: {selected.type || "-"}</Text>

              {!!selected.professorName && (
                <Text style={styles.meta}>
                  Professor: {selected.professorName}
                </Text>
              )}

              {!!selected.floorName && (
                <Text style={styles.meta}>Floor: {selected.floorName}</Text>
              )}

              {!!selected.schedule?.length && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.sectionTitle}>Schedule</Text>
                  {selected.schedule.map((x, idx) => (
                    <Text key={idx} style={styles.meta}>
                      {x.courseName} • {x.day} • {x.startTime}-{x.endTime}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: { color: "white", fontSize: 26, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6, marginBottom: 14 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    color: "white",
    fontSize: 16,
  },
  searchBtn: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  roomTitle: { color: "white", fontSize: 17, fontWeight: "900" },
  meta: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  smallBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnText: { color: "white", fontWeight: "900" },
  info: { color: "white", marginTop: 12 },
  err: { color: "#ff6b6b", marginTop: 12, fontWeight: "900" },
  sectionTitle: { color: "white", fontWeight: "900", marginBottom: 6 },
});
