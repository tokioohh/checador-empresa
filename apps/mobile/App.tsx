import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { getToken, getEmployee, getDeviceId } from "./src/storage/device";
import { api, ApiError } from "./src/api/client";

import LoginScreen from "./src/screens/LoginScreen";
import SetupScreen from "./src/screens/SetupScreen";
import HomeScreen from "./src/screens/HomeScreen";
import QRScannerScreen from "./src/screens/QRScannerScreen";
import SuccessScreen from "./src/screens/SuccessScreen";

export type RootStackParamList = {
  Login: undefined;
  Setup: { token: string };
  Home: {
    token: string;
    dispositivoId: string;
    empleado: {
      id: string;
      nombre: string;
      numeroEmpleado: string;
      puesto: string | null;
      estado: string;
      dispositivoRegistrado: boolean;
      dispositivoId: string | null;
    };
  };
  QRScanner: { token: string; dispositivoId: string };
  Success: {
    asistencia: {
      id: string;
      tipo: string;
      timestamp: string;
      puntualidad: string | null;
      empleado: { nombre: string; puesto: string | null };
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface InitialRoute {
  name: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const token = await getToken();

      if (!token) {
        setInitialRoute({ name: "Login" });
        return;
      }

      try {
        type MeResponse = {
          empleado: {
            id: string;
            nombre: string;
            numeroEmpleado: string;
            puesto: string | null;
            estado: string;
            dispositivoRegistrado: boolean;
            dispositivoId: string | null;
          };
        };
        const { empleado } = await api.get<MeResponse>("/auth/empleado/me", token);
        const deviceId = await getDeviceId();

        if (!empleado.dispositivoRegistrado || !deviceId) {
          setInitialRoute({ name: "Setup", params: { token } });
        } else {
          setInitialRoute({
            name: "Home",
            params: { token, dispositivoId: deviceId, empleado },
          });
        }
      } catch {
        // Token expirado o inválido → volver al login
        setInitialRoute({ name: "Login" });
      }
    }

    bootstrap();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {/* @ts-expect-error React Navigation 6 / TypeScript 5 type compat issue */}
      <Stack.Navigator
        initialRouteName={initialRoute.name}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="Success" component={SuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
