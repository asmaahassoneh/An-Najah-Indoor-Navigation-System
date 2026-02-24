import { useContext, useState } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import useApi from "../src/services/useApi";
import { AuthContext } from "../src/context/auth.context";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import PasswordInput from "../src/components/PasswordInput";

export default function Login() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const api = useApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });
      login(res.data.user, res.data.token);
      router.replace("/");
    } catch (e) {
      setError(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded={false}>
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Login</Text>

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

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />

          <Pressable
            onPress={submit}
            disabled={loading}
            style={[styles.btn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/forgot-password")}>
            <Text
              style={{
                color: "#cbd5f5",
                textAlign: "center",
                marginTop: 12,
                fontWeight: "800",
              }}
            >
              Forgot password?
            </Text>
          </Pressable>

          {!!error && <Text style={styles.err}>{error}</Text>}
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
});
