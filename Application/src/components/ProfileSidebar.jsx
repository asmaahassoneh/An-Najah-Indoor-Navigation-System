import { useEffect, useRef, useContext } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  X,
  User,
  Settings,
  KeyRound,
  LayoutDashboard,
  LogOut,
  CalendarDays,
  Mail,
} from "lucide-react-native";
import { AuthContext } from "../context/auth.context";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, width * 0.78);

export default function ProfileSidebar({ open, onClose }) {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SIDEBAR_WIDTH);
      fadeAnim.setValue(0);
    }
  }, [open, slideAnim, fadeAnim]);

  const goTo = (path) => {
    onClose?.();
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onClose?.();
      router.replace("/login");
    }
  };

  if (!open) return null;

  return (
    <Modal transparent visible={open} animationType="none">
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View>
            <View style={styles.header}>
              <Text style={styles.userPill}>{user?.username || "User"}</Text>

              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X color="white" size={18} />
              </Pressable>
            </View>

            <View style={styles.menu}>
              <SidebarItem
                icon={<User color="white" size={20} />}
                label="Profile"
                onPress={() => goTo("/profile")}
              />

              <SidebarItem
                icon={<Settings color="white" size={20} />}
                label="Settings"
                onPress={() => goTo("/settings")}
              />

              <SidebarItem
                icon={<KeyRound color="white" size={20} />}
                label="Reset Password"
                onPress={() => goTo("/reset-password")}
              />

              {(user?.role === "student" || user?.role === "professor") && (
                <>
                  <SidebarItem
                    icon={<CalendarDays color="white" size={20} />}
                    label="My Schedule"
                    onPress={() => goTo("/my-schedule")}
                  />

                  <SidebarItem
                    icon={<Mail color="white" size={20} />}
                    label="Inbox"
                    onPress={() => goTo("/inbox")}
                  />
                </>
              )}

              {user?.role === "admin" && (
                <SidebarItem
                  icon={<LayoutDashboard color="white" size={20} />}
                  label="Dashboard"
                  onPress={() => goTo("/admin")}
                />
              )}
            </View>
          </View>

          <View style={styles.bottom}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut color="#ff6b6b" size={20} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SidebarItem({ icon, label, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemIcon}>{icon}</View>
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-start",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#13204b",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.08)",
    paddingTop: 58,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  userPill: {
    color: "white",
    fontWeight: "900",
    backgroundColor: "rgba(143,92,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(143,92,255,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  menu: {
    gap: 14,
    flex: 1,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  itemIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  itemText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },

  bottom: {
    paddingBottom: 30,
    alignItems: "flex-end",
  },

  logoutBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(120, 30, 60, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.18)",
  },
});
