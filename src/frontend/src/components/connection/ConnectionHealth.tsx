import { useLocalNexus } from '@/state/localNexusStore';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionHealth() {
  const { connectionState } = useLocalNexus();

  if (connectionState !== 'connected' && connectionState !== 'disconnected') {
    return null;
  }

  const isConnected = connectionState === 'connected';

  return (
    <Badge variant={isConnected ? 'secondary' : 'destructive'} className="gap-1.5">
      {isConnected ? (
        <>
          <Wifi className="h-3.5 w-3.5 text-green-500" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Disconnected</span>
        </>
      )}
    </Badge>
  );
}
