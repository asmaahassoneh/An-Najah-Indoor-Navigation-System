import { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import useApi from "../src/services/useApi";
import GlowBackground from "../src/components/GlowBackground";

export default function MySchedule() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function isOnlineRoom(code) {
  const v = String(code || "").trim();
  return v === "509999" || v.toUpperCase() === "ONLINE";
}

function Inner() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const api = useApi();

  const fetchSchedule = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/schedule/me");
      setItems(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <Text style={styles.title}>My Schedule</Text>
          <Pressable
            onPress={() => router.push("/import-schedule")}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Import / Update</Text>
          </Pressable>
        </View>

        {loading && <Text style={{ color: "white" }}>Loading...</Text>}
        {!!err && (
          <Text style={{ color: "#ff6b6b", fontWeight: "900" }}>{err}</Text>
        )}

        {!loading && !err && items.length === 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: "white" }}>No schedule yet.</Text>
            <Pressable
              onPress={() => router.push("/import-schedule")}
              style={[styles.btn, { marginTop: 10 }]}
            >
              <Text style={styles.btnText}>Import from Zajel</Text>
            </Pressable>
          </View>
        )}

        {!!items.length && (
          <ScrollView style={{ marginTop: 12 }}>
            {items.map((x) => {
              const online = isOnlineRoom(x.roomCode);

              return (
                <View key={x.id} style={styles.card}>
                  <Text style={styles.course}>{x.courseName}</Text>

                  <Text style={styles.meta}>
                    {x.day} • {x.startTime}-{x.endTime} • {x.roomCode}
                  </Text>

                  <Text style={styles.meta}>Instructor: {x.instructor}</Text>

                  {online ? (
                    <Text style={styles.onlineNote}>
                      Online class — no navigation
                    </Text>
                  ) : (
                    <Pressable
                      onPress={() => router.push(`/navigate/${x.roomCode}`)}
                      style={[
                        styles.btn,
                        styles.btnSecondary,
                        { marginTop: 10 },
                      ]}
                    >
                      <Text style={styles.btnText}>Navigate</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { color: "white", fontSize: 26, fontWeight: "900" },

  btn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnText: { color: "white", fontWeight: "900" },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  course: { color: "white", fontSize: 16, fontWeight: "900" },
  meta: { color: "rgba(255,255,255,0.75)", marginTop: 4 },

  onlineNote: {
    marginTop: 10,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "900",
  },
});
