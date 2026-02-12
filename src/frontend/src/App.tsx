import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { LocalNexusProvider } from './state/localNexusStore';
import AppShell from './components/layout/AppShell';
import DiscoveryScreen from './screens/DiscoveryScreen';
import ChatScreen from './screens/ChatScreen';
import GamesScreen from './screens/GamesScreen';

type Screen = 'discovery' | 'chat' | 'games';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('discovery');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LocalNexusProvider>
          <AppShell activeScreen={activeScreen} onScreenChange={setActiveScreen}>
            {activeScreen === 'discovery' && <DiscoveryScreen />}
            {activeScreen === 'chat' && <ChatScreen />}
            {activeScreen === 'games' && <GamesScreen />}
          </AppShell>
          <Toaster />
        </LocalNexusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
