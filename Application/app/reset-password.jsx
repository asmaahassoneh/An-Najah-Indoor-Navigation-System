import { useContext, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import GlowBackground from "../src/components/GlowBackground";

import useApi from "../src/services/useApi";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import PasswordInput from "../src/components/PasswordInput";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import { AuthContext } from "../src/context/auth.context";

export default function ResetPassword() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const api = useApi();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setMsg("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(`/users/change-password/${user.id}`, {
        oldPassword,
        newPassword,
      });
      setMsg(res.data.message || "Password updated ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.replace("/profile"), 800);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Reset Password</Text>

        <View style={styles.card}>
          <PasswordInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Old Password"
          />
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
          />
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm New Password"
          />

          <Pressable
            onPress={submit}
            disabled={loading}
            style={[styles.btn, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.btnText}>
              {loading ? "Updating..." : "Update Password"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/profile")}
            style={[styles.btn, styles.secondary]}
          >
            <Text style={styles.btnText}>Back to Profile</Text>
          </Pressable>

          {!!error && <Text style={styles.err}>{error}</Text>}
          {!!msg && <Text style={styles.ok}>{msg}</Text>}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  btn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
    marginTop: 4,
  },
  secondary: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnText: { color: "white", fontWeight: "900" },
  err: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "800",
  },
  ok: {
    color: "#4ade80",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "900",
  },
});
