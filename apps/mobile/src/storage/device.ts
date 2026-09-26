import * as SecureStore from "expo-secure-store";

const KEYS = {
  employeeToken: "checador_emp_token",
  deviceKey: "checador_device_key",
  deviceId: "checador_device_id",
  employeeInfo: "checador_emp_info",
} as const;

export interface StoredEmployee {
  id: string;
  nombre: string;
  numeroEmpleado: string;
  puesto: string | null;
}

export async function saveSession(token: string, employee: StoredEmployee) {
  await SecureStore.setItemAsync(KEYS.employeeToken, token);
  await SecureStore.setItemAsync(KEYS.employeeInfo, JSON.stringify(employee));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.employeeToken);
}

export async function getEmployee(): Promise<StoredEmployee | null> {
  const raw = await SecureStore.getItemAsync(KEYS.employeeInfo);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredEmployee;
  } catch {
    return null;
  }
}

export async function saveDevice(deviceKey: string, deviceId: string) {
  await SecureStore.setItemAsync(KEYS.deviceKey, deviceKey);
  await SecureStore.setItemAsync(KEYS.deviceId, deviceId);
}

export async function getDeviceKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.deviceKey);
}

export async function getDeviceId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.deviceId);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEYS.employeeToken);
  await SecureStore.deleteItemAsync(KEYS.employeeInfo);
}

export async function clearDevice() {
  await SecureStore.deleteItemAsync(KEYS.deviceKey);
  await SecureStore.deleteItemAsync(KEYS.deviceId);
}
