import { Text, View, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../src/context/auth.context";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <Screen padded={false}>
      <AppNavbar />

      <View style={styles.center}>
        {user ? (
          <>
            <Text style={styles.h1}>Welcome {user.username}</Text>
            <Text style={styles.p}>Role: {user.role}</Text>
          </>
        ) : (
          <>
            <Text style={styles.h1}>Welcome to User System</Text>
            <Text style={styles.p}>Please login or register</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  h1: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  p: { color: "#ccc", fontSize: 16 },
});
