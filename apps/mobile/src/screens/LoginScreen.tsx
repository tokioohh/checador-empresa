import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api, ApiError, type LoginEmpleadoResponse } from "../api/client";
import { saveSession } from "../storage/device";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [numero, setNumero] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!numero.trim() || !password.trim()) {
      setError("Ingresa tu número de empleado y contraseña.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post<LoginEmpleadoResponse>(
        "/auth/empleado/login",
        { numeroEmpleado: numero.trim(), password }
      );

      await saveSession(res.token, {
        id: res.empleado.id,
        nombre: res.empleado.nombre,
        numeroEmpleado: res.empleado.numeroEmpleado,
        puesto: res.empleado.puesto,
      });

      if (!res.empleado.dispositivoRegistrado) {
        navigation.replace("Setup", { token: res.token });
      } else {
        navigation.replace("Home", {
          token: res.token,
          dispositivoId: res.empleado.dispositivoId!,
          empleado: res.empleado,
        });
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setError("Número de empleado o contraseña incorrectos.");
        } else if (e.status === 403) {
          setError("Tu cuenta está inactiva. Contacta a Recursos Humanos.");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Checador</Text>
        <Text style={styles.subtitle}>Acceso de empleados</Text>

        <TextInput
          style={styles.input}
          placeholder="Número de empleado"
          autoCapitalize="characters"
          value={numero}
          onChangeText={setNumero}
          returnKeyType="next"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: "#fafafa",
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
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#90a4ae",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
