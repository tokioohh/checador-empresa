import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Success">;

export default function SuccessScreen({ route, navigation }: Props) {
  const { asistencia } = route.params;

  const hora = new Date(asistencia.timestamp).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const puntualidadLabel =
    asistencia.puntualidad === "A_TIEMPO"
      ? "A tiempo"
      : asistencia.puntualidad === "RETARDO"
      ? "Con retardo"
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✓</Text>
      </View>

      <Text style={styles.title}>Entrada registrada</Text>

      <View style={styles.card}>
        <Row label="Empleado" value={asistencia.empleado.nombre} />
        {asistencia.empleado.puesto && (
          <Row label="Puesto" value={asistencia.empleado.puesto} />
        )}
        <Row label="Hora" value={hora} />
        {puntualidadLabel && (
          <Row label="Puntualidad" value={puntualidadLabel} />
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.buttonText}>Listo</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLabel: {
    fontSize: 14,
    color: "#888",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    maxWidth: "60%",
    textAlign: "right",
  },
  button: {
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
