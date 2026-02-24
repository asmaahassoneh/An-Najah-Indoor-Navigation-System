import { useContext } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import { AuthContext } from "../src/context/auth.context";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import useApi from "../src/services/useApi";

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileInner />
    </ProtectedRoute>
  );
}

function ProfileInner() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const api = useApi();

  const doLogout = async () => {
    try {
      if (user?.id) {
        await api.post(`/users/logout/${user.id}`);
      }
    } catch (e) {
      console.log("Backend logout failed:", e?.response?.data || e.message);
    } finally {
      await logout();
      router.replace("/");
    }
  };

  return (
    <Screen padded={false}>
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.h2}>Profile</Text>

          <Text style={styles.p}>
            <Text style={styles.bold}>Username: </Text>
            {user.username}
          </Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>Email: </Text>
            {user.email}
          </Text>
          <Text style={styles.p}>
            <Text style={styles.bold}>Role: </Text>
            {user.role}
          </Text>

          <Pressable
            onPress={() => router.push("/reset-password")}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Reset Password</Text>
          </Pressable>

          <Pressable
            onPress={doLogout}
            style={[styles.btn, { backgroundColor: "#ff4d4d" }]}
          >
            <Text style={styles.btnText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  h2: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  p: { color: "white", fontSize: 16 },
  bold: { fontWeight: "900" },
  btn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
    marginTop: 6,
  },
  btnText: { color: "white", fontWeight: "900" },
});
