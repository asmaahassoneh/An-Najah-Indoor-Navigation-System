import { Pressable, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/webStyle";

export default function GradientButton({ title, onPress, style, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        pressed && !disabled && { transform: [{ translateY: -2 }] },
        disabled && { opacity: 0.55 },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primary1, colors.primary2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: "hidden",
  },
  grad: {
    height: 54,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "white", fontWeight: "900", fontSize: 16 },
});
