/**
 * Simulates device discovery by returning a predefined list of nearby devices.
 * Mimics NSD/Wi-Fi Direct behavior for demo purposes.
 */

export interface SimulatedDevice {
  id: string;
  name: string;
  lastSeen: number;
}

const SIMULATED_DEVICES: SimulatedDevice[] = [
  { id: 'device-1', name: 'Alice\'s Phone', lastSeen: Date.now() },
  { id: 'device-2', name: 'Bob\'s Tablet', lastSeen: Date.now() - 30000 },
  { id: 'device-3', name: 'Charlie\'s Laptop', lastSeen: Date.now() - 60000 },
];

export function simulateDiscovery(delayMs: number = 1500): Promise<SimulatedDevice[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(SIMULATED_DEVICES.map(device => ({
        ...device,
        lastSeen: Date.now() - Math.random() * 120000, // Random last seen within 2 minutes
      })));
    }, delayMs);
  });
}
