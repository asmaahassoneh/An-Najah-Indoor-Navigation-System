import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import useApi from "../src/services/useApi";
import GlowBackground from "../src/components/GlowBackground";

export default function ForgotPassword() {
  const router = useRouter();
  const api = useApi();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/users/forgot-password", { email });
      setMsg(res.data?.message || "If the email exists, a code has been sent.");
      router.push({ pathname: "/reset-with-code", params: { email } });
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />
      <View style={styles.wrap}>
        <Text style={styles.title}>Forgot Password</Text>

        <View style={styles.card}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#cbd5f5"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Pressable
            onPress={sendCode}
            disabled={loading}
            style={[styles.btn, loading && { opacity: 0.7 }]}
          >
            <Text style={styles.btnText}>
              {loading ? "Sending..." : "Send code"}
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
