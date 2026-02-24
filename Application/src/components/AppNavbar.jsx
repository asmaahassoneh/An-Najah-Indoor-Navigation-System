import { StyleSheet, Text, View, Pressable } from "react-native";
import { useContext } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/auth.context";

export default function AppNavbar() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.nav}>
      <Text style={styles.logo}>Navigation System</Text>

      <View style={styles.links}>
        <NavBtn label="Home" onPress={() => router.push("/")} />

        {user && (user.role === "student" || user.role === "professor") && (
          <NavBtn
            label="My Schedule"
            onPress={() => router.push("/my-schedule")}
          />
        )}

        {!user && (
          <NavBtn label="Register" onPress={() => router.push("/register")} />
        )}
        {!user && (
          <NavBtn label="Login" onPress={() => router.push("/login")} />
        )}

        {user?.role === "admin" && (
          <NavBtn label="Dashboard" onPress={() => router.push("/admin")} />
        )}

        {user && (
          <NavBtn label="Profile" onPress={() => router.push("/profile")} />
        )}
      </View>
    </View>
  );
}

function NavBtn({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  logo: { color: "white", fontWeight: "800", fontSize: 16 },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 12 },
});
