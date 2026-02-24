import { View, StyleSheet } from "react-native";

export default function GlowBackground() {
  return (
    <>
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />
      <View style={[styles.glow, styles.glow3]} />
    </>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 520,
    opacity: 0.22,
  },
  glow1: { backgroundColor: "#8f5cff", top: -180, left: -180 },
  glow2: {
    backgroundColor: "#38bdf8",
    bottom: -200,
    right: -200,
    opacity: 0.16,
  },
  glow3: { backgroundColor: "#22c55e", bottom: -240, left: -200, opacity: 0.1 },
});
