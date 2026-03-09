import { useState, useContext } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { AuthContext } from "../context/auth.context";
import ProfileSidebar from "./ProfileSidebar";

export default function AppNavbar() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <View style={styles.navbar}>
        {/* LEFT */}
        <View style={styles.left}>
          {user && (
            <Pressable
              style={styles.iconBtn}
              onPress={() => setSidebarOpen(true)}
            >
              <Feather name="menu" size={22} color="white" />
            </Pressable>
          )}
        </View>

        {/* CENTER */}
        <Text style={styles.logo}>Navigation System</Text>

        {/* RIGHT */}
        <View style={styles.right}>
          {user ? (
            <Pressable style={styles.iconBtn} onPress={() => router.push("/")}>
              <Feather name="home" size={22} color="white" />
            </Pressable>
          ) : (
            <View style={styles.authBtns}>
              <Pressable
                style={styles.navBtn}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.navBtnText}>Login</Text>
              </Pressable>

              <Pressable
                style={styles.navBtn}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.navBtnText}>Sign Up</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {user && (
        <ProfileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    minWidth: 60,
  },

  right: {
    minWidth: 120,
    alignItems: "flex-end",
  },

  authBtns: {
    flexDirection: "row",
    gap: 8,
  },

  logo: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  navBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  navBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
});
