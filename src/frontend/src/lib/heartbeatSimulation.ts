/**
 * Simulates connection heartbeat with periodic health updates.
 * Used for demonstrating connection reliability monitoring.
 */

type HeartbeatCallback = (health: number) => void;

let intervalId: NodeJS.Timeout | null = null;

export function startHeartbeat(callback: HeartbeatCallback, intervalMs: number = 5000): void {
  if (intervalId) {
    stopHeartbeat();
  }

  intervalId = setInterval(() => {
    // Simulate health fluctuation between 70-100%
    const health = 70 + Math.random() * 30;
    callback(Math.round(health));
  }, intervalMs);
}

export function stopHeartbeat(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
