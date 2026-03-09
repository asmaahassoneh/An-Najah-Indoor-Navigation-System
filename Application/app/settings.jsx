import { Text, View, StyleSheet } from "react-native";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import GlowBackground from "../src/components/GlowBackground";
import ProtectedRoute from "../src/routes/ProtectedRoute";

export default function Settings() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.sub}>Account settings will be here.</Text>
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
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  sub: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 8,
  },
});
