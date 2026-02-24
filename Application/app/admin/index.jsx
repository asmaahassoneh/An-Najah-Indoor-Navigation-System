import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

import Screen from "../../src/components/Screen";
import AppNavbar from "../../src/components/AppNavbar";
import GlowBackground from "../../src/components/GlowBackground";
import AdminRoute from "../../src/routes/AdminRoute";

export default function AdminHome() {
  return (
    <AdminRoute>
      <Inner />
    </AdminRoute>
  );
}

function Inner() {
  const router = useRouter();

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.hero}>
          <Text style={styles.badge}>Admin</Text>

          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.sub}>Choose what you want to manage</Text>

          <View style={styles.grid}>
            <Pressable
              style={styles.card}
              onPress={() => router.push("/admin/users")}
            >
              <Text style={styles.icon}>👤</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Manage Users</Text>
                <Text style={styles.cardSub}>
                  Edit usernames, emails, roles, room codes
                </Text>
              </View>

              <Text style={styles.arrow}>→</Text>
            </Pressable>

            <Pressable
              style={styles.card}
              onPress={() => router.push("/admin/rooms")}
            >
              <Text style={styles.icon}>🏫</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Manage Rooms</Text>
                <Text style={styles.cardSub}>
                  Create, update, delete room codes and types
                </Text>
              </View>

              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  hero: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(143,92,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(143,92,255,0.35)",
    color: "white",
    fontWeight: "900",
    marginBottom: 10,
  },
  title: { color: "white", fontSize: 26, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6 },

  grid: { marginTop: 14, gap: 12 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  icon: { fontSize: 22 },
  cardTitle: { color: "white", fontWeight: "900", fontSize: 16 },
  cardSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  arrow: { color: "white", fontWeight: "900", fontSize: 18 },
});
