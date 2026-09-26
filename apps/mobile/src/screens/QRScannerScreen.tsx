import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as LocalAuthentication from "expo-local-authentication";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  api,
  ApiError,
  type ChallengeResponse,
  type AsistenciaResponse,
} from "../api/client";
import { getDeviceKey } from "../storage/device";
import { signChallenge } from "../utils/crypto";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "QRScanner">;

type Stage =
  | "scanning"
  | "processing_qr"
  | "biometric"
  | "signing"
  | "registering";

export default function QRScannerScreen({ route, navigation }: Props) {
  const { token, dispositivoId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>("scanning");
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  async function handleBarcode(data: string) {
    if (scannedRef.current) return;
    scannedRef.current = true;

    setStage("processing_qr");
    setError(null);

    let challengeId: string;
    let challenge: string;

    // Paso 1: validar QR y obtener challenge
    try {
      const res = await api.post<ChallengeResponse>(
        "/asistencias/challenge",
        { qrToken: data, dispositivoId },
        token
      );
      challengeId = res.challengeId;
      challenge = res.challenge;
    } catch (e) {
      let msg = "No se pudo conectar con el servidor.";
      if (e instanceof ApiError) {
        if (e.status === 400) {
          const lower = e.message.toLowerCase();
          msg = lower.includes("expir")
            ? "El código QR ha expirado.\nSolicita un nuevo código."
            : "El código QR no es válido.";
        } else {
          msg = e.message;
        }
      }
      setError(msg);
      setStage("scanning");
      scannedRef.current = false;
      return;
    }

    // Paso 2: biometría
    setStage("biometric");

    const biometricResult = await LocalAuthentication.authenticateAsync({
      promptMessage: "Coloca tu dedo en el sensor",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
    });

    if (!biometricResult.success) {
      setError("No se pudo verificar tu identidad.");
      setStage("scanning");
      scannedRef.current = false;
      return;
    }

    // Paso 3: firmar challenge
    setStage("signing");

    const deviceKey = await getDeviceKey();
    if (!deviceKey) {
      setError("Dispositivo no configurado. Vuelve a activar el dispositivo.");
      setStage("scanning");
      scannedRef.current = false;
      return;
    }

    let firma: string;
    try {
      firma = await signChallenge(challenge, deviceKey);
    } catch {
      setError("Error al generar la firma del dispositivo.");
      setStage("scanning");
      scannedRef.current = false;
      return;
    }

    // Paso 4: registrar asistencia
    setStage("registering");

    try {
      const res = await api.post<AsistenciaResponse>(
        "/asistencias",
        { challengeId, dispositivoId, firma },
        token
      );

      navigation.replace("Success", { asistencia: res.asistencia });
    } catch (e) {
      let msg = "No se pudo conectar con el servidor.";
      if (e instanceof ApiError) {
        if (e.status === 401) {
          msg = "No se pudo verificar la identidad del dispositivo.";
        } else if (e.status === 409) {
          msg = e.message;
        } else {
          msg = e.message;
        }
      }
      setError(msg);
      setStage("scanning");
      scannedRef.current = false;
    }
  }

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Se necesita acceso a la cámara para escanear el QR.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isProcessing = stage !== "scanning";

  return (
    <View style={styles.container}>
      {!isProcessing ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => handleBarcode(data)}
        />
      ) : (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#1565c0" />
          <Text style={styles.stageText}>{stageLabel(stage)}</Text>
        </View>
      )}

      <View style={styles.overlay}>
        {!isProcessing && (
          <>
            <Text style={styles.overlayTitle}>Escanea el QR de la empresa</Text>
            <View style={styles.reticle} />
          </>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isProcessing}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function stageLabel(stage: Stage): string {
  switch (stage) {
    case "processing_qr":
      return "Validando QR...";
    case "biometric":
      return "Verificando identidad...";
    case "signing":
      return "Identidad verificada\nEnviando confirmación...";
    case "registering":
      return "Registrando entrada...";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  permissionText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  processingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  stageText: {
    marginTop: 16,
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  reticle: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
  },
  errorBox: {
    backgroundColor: "rgba(211,47,47,0.9)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "90%",
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#1565c0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: { color: "#fff", fontSize: 15 },
});
