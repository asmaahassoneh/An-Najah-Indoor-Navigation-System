import { Text, View } from "react-native";
import Screen from "../src/components/Screen";
import AppNavbar from "../src/components/AppNavbar";
import GlowBackground from "../src/components/GlowBackground";

export default function NotFound() {
  return (
    <Screen padded={false}>
      <GlowBackground />
      <AppNavbar />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "white", fontWeight: "900", fontSize: 20 }}>
          404 - Page Not Found
        </Text>
      </View>
    </Screen>
  );
}
