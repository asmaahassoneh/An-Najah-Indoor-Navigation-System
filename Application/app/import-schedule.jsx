import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";

import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import useApi from "../src/services/useApi";
import { parseZajelText } from "../src/utils/parseZajelSchedule";
import GlowBackground from "../src/components/GlowBackground";

export default function ImportSchedule() {
  return (
    <ProtectedRoute>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const api = useApi();

  const preview = () => {
    const parsed = parseZajelText(raw);
    setItems(parsed);
    setMsg(
      parsed.length ? "" : "No rows detected. Copy the table again from Zajel.",
    );
  };

  const save = async () => {
    setMsg("");

    try {
      await api.post("/schedule/import", { items });
      setMsg("Saved ✅");
    } catch (e) {
      setMsg(e.response?.data?.error || "Save failed");
    }
  };

  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />

      <View style={styles.wrap}>
        <Text style={styles.title}>Import My Schedule</Text>
        <Text style={styles.sub}>
          Zajel → Copy timetable → Paste → Preview → Save
        </Text>

        <TextInput
          value={raw}
          onChangeText={setRaw}
          placeholder="Paste from Zajel..."
          placeholderTextColor="#cbd5f5"
          multiline
          style={styles.textarea}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={preview} style={styles.btnSecondary}>
            <Text style={styles.btnText}>Preview</Text>
          </Pressable>

          <Pressable
            onPress={save}
            disabled={!items.length}
            style={[styles.btn, !items.length && { opacity: 0.5 }]}
          >
            <Text style={styles.btnText}>Save</Text>
          </Pressable>
        </View>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}

        {!!items.length && (
          <ScrollView style={{ marginTop: 12 }}>
            {items.map((x, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowText}>{x.courseName}</Text>
                <Text style={styles.rowSub}>
                  {x.day} • {x.startTime}-{x.endTime} • {x.roomCode}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  title: { color: "white", fontSize: 26, fontWeight: "900" },
  sub: { color: "rgba(255,255,255,0.75)", marginTop: 6, marginBottom: 12 },
  textarea: {
    minHeight: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 12,
    color: "white",
    textAlignVertical: "top",
    marginBottom: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8f5cff",
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  btnText: { color: "white", fontWeight: "900" },
  msg: { marginTop: 10, color: "white" },
  row: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  rowText: { color: "white", fontWeight: "900" },
  rowSub: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
});
