import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { clearSession, clearDevice } from "../storage/device";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ route, navigation }: Props) {
  const { token, dispositivoId, empleado } = route.params;

  async function handleLogout() {
    await clearSession();
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenido</Text>
        <Text style={styles.name}>{empleado.nombre}</Text>
        {empleado.puesto && (
          <Text style={styles.puesto}>{empleado.puesto}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Estado de entrada</Text>
        <Text style={styles.cardStatus}>No registrada</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("QRScanner", { token, dispositivoId })
        }
      >
        <Text style={styles.buttonText}>Registrar entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  welcome: {
    fontSize: 16,
    color: "#666",
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 4,
  },
  puesto: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardStatus: {
    fontSize: 18,
    fontWeight: "600",
    color: "#888",
  },
  button: {
    backgroundColor: "#1565c0",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    color: "#888",
    fontSize: 14,
  },
});
