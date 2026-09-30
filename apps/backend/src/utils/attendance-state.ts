export type AttendanceType = "ENTRADA" | "SALIDA";
export type AttendancePresence = "ACTIVO" | "INACTIVO";

export function nextAttendanceType(lastType: AttendanceType | null): AttendanceType {
  return lastType === "ENTRADA" ? "SALIDA" : "ENTRADA";
}

export function attendancePresence(lastType: AttendanceType | null): AttendancePresence {
  return lastType === "ENTRADA" ? "ACTIVO" : "INACTIVO";
}
