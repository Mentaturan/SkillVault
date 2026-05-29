export function nowTimestamp() {
  return Date.now();
}

export function timestampToIso(timestamp: number | null) {
  return timestamp === null ? null : new Date(timestamp).toISOString();
}
