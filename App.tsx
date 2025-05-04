import { StyleSheet, Text, View } from "react-native";
import {StatusBar} from "expo-status-bar";
import Map from "./components/ui/Map";
import Header from "./components/ui/layouts/Header";

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <Map />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
