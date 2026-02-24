import { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Password",
  autoComplete = "password",
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#cbd5f5"
        secureTextEntry={!show}
        style={styles.input}
        autoComplete={autoComplete}
      />
      <Pressable onPress={() => setShow((s) => !s)} style={styles.eye}>
        <Text style={{ color: "white", fontWeight: "800" }}>
          {show ? "🙈" : "👁️"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    height: 52,
    justifyContent: "center",
  },
  input: {
    height: 52,
    paddingHorizontal: 14,
    paddingRight: 56,
    color: "white",
    fontSize: 16,
  },
  eye: {
    position: "absolute",
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
