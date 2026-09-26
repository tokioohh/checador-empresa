import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, ApiError, type ActivarDispositivoResponse } from "../api/client";
import { saveDevice, getEmployee } from "../storage/device";
import { generateDeviceKey } from "../utils/crypto";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Setup">;

export default function SetupScreen({ route, navigation }: Props) {
  const { token } = route.params;
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleActivar() {
    if (!codigo.trim()) {
      setError("Ingresa el código de activación.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const deviceKey = await generateDeviceKey();

      const res = await api.post<ActivarDispositivoResponse>(
        "/dispositivos/activar",
        {
          codigo: codigo.trim().toUpperCase(),
          publicKey: deviceKey,
          plataforma: Platform.OS === "ios" ? "ios" : "android",
        },
        token
      );

      await saveDevice(deviceKey, res.dispositivo.id);

      const empleado = await getEmployee();

      navigation.replace("Home", {
        token,
        dispositivoId: res.dispositivo.id,
        empleado: {
          id: empleado?.id ?? "",
          nombre: empleado?.nombre ?? "",
          numeroEmpleado: empleado?.numeroEmpleado ?? "",
          puesto: empleado?.puesto ?? null,
          estado: "ACTIVO",
          dispositivoRegistrado: true,
          dispositivoId: res.dispositivo.id,
        },
      });
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 400) {
          setError("Código de activación inválido o expirado.");
        } else {
          setError(e.message);
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activar dispositivo</Text>
      <Text style={styles.body}>
        Pide a tu administrador un código de activación e ingrésalo abajo.
        Solo necesitas hacer esto una vez.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Código de activación"
        autoCapitalize="characters"
        value={codigo}
        onChangeText={setCodigo}
        returnKeyType="done"
        onSubmitEditing={handleActivar}
        editable={!loading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleActivar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Activar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 2,
    backgroundColor: "#fff",
    marginBottom: 14,
    textAlign: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#90a4ae" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
