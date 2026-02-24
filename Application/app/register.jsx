import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

import useApi from "../src/services/useApi";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import PasswordInput from "../src/components/PasswordInput";

export default function Register() {
  const router = useRouter();
  const api = useApi();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roomId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const change = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/users/register", form);
      setSuccess(res.data.message || "Registered ✅");
      setTimeout(() => router.replace("/login"), 900);
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <Screen padded={false}>
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Register</Text>

        <View style={styles.card}>
          <TextInput
            value={form.username}
            onChangeText={(v) => change("username", v)}
            placeholder="Username"
            placeholderTextColor="#cbd5f5"
            style={styles.input}
          />

          <TextInput
            value={form.email}
            onChangeText={(v) => change("email", v)}
            placeholder="Email"
            placeholderTextColor="#cbd5f5"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <PasswordInput
            value={form.password}
            onChangeText={(v) => change("password", v)}
          />

          {form.email.endsWith("@najah.edu") && (
            <TextInput
              value={form.roomId}
              onChangeText={(v) => change("roomId", v)}
              placeholder="Room (Professors only)"
              placeholderTextColor="#cbd5f5"
              style={styles.input}
            />
          )}

          <Pressable onPress={submit} style={styles.btn}>
            <Text style={styles.btnText}>Register</Text>
          </Pressable>

          {!!error && <Text style={styles.err}>{error}</Text>}
          {!!success && <Text style={styles.ok}>{success}</Text>}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
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
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
    marginTop: 4,
  },
  btnText: { color: "white", fontWeight: "800", fontSize: 16 },
  err: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "700",
  },
  ok: {
    color: "#4ade80",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "800",
  },
});
