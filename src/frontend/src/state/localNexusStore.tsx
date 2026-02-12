import { createContext, useContext, ReactNode, useState } from 'react';
import { Principal } from '@dfinity/principal';

export type ConnectionState = 'idle' | 'scanning' | 'found' | 'connecting' | 'connected' | 'disconnected';

export interface PeerDevice {
  principal: Principal;
  name: string;
  lastSeen: number;
}

// Legacy Device type for compatibility
export interface Device {
  id: string;
  name: string;
  lastSeen: number;
}

interface LocalNexusState {
  connectionState: ConnectionState;
  selectedPeer: PeerDevice | null;
}

interface LocalNexusContextValue extends LocalNexusState {
  setConnectionState: (state: ConnectionState) => void;
  setSelectedPeer: (peer: PeerDevice | null) => void;
  clearAllData: () => void;
}

const LocalNexusContext = createContext<LocalNexusContextValue | undefined>(undefined);

const initialState: LocalNexusState = {
  connectionState: 'idle',
  selectedPeer: null,
};

export function LocalNexusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalNexusState>(initialState);

  const setConnectionState = (connectionState: ConnectionState) => {
    setState((prev) => ({ ...prev, connectionState }));
  };

  const setSelectedPeer = (selectedPeer: PeerDevice | null) => {
    setState((prev) => ({ ...prev, selectedPeer }));
  };

  const clearAllData = () => {
    setState(initialState);
  };

  const value: LocalNexusContextValue = {
    ...state,
    setConnectionState,
    setSelectedPeer,
    clearAllData,
  };

  return <LocalNexusContext.Provider value={value}>{children}</LocalNexusContext.Provider>;
}

export function useLocalNexus() {
  const context = useContext(LocalNexusContext);
  if (!context) {
    throw new Error('useLocalNexus must be used within LocalNexusProvider');
  }
  return context;
}
