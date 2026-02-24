import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import PasswordInput from "../src/components/PasswordInput";
import useApi from "../src/services/useApi";

export default function ResetWithCode() {
  const router = useRouter();
  const api = useApi();
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = async () => {
    setErr("");
    setMsg("");

    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/users/reset-password-with-code", {
        email,
        code,
        newPassword,
      });
      setMsg(res.data?.message || "Password reset ✅");
      setTimeout(() => router.replace("/login"), 900);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <AppNavbar />
      <View style={styles.wrap}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>We sent a code to: {String(email || "")}</Text>

        <View style={styles.card}>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            placeholderTextColor="#cbd5f5"
            keyboardType="number-pad"
            style={styles.input}
          />

          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
          />
          <PasswordInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm new password"
          />

          <Pressable
            onPress={reset}
            disabled={loading}
            style={[styles.btn, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.btnText}>
              {loading ? "Resetting..." : "Reset password"}
            </Text>
          </Pressable>

          {!!err && <Text style={styles.err}>{err}</Text>}
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
  },
  sub: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 6,
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
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    color: "white",
    fontSize: 16,
  },
  btn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  btnText: { color: "white", fontWeight: "900" },
  err: { color: "#ff6b6b", textAlign: "center", fontWeight: "900" },
  ok: { color: "#4ade80", textAlign: "center", fontWeight: "900" },
});
