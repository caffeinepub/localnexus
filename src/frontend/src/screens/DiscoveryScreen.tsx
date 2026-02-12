import { useEffect } from 'react';
import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useNumActivePeers, useUpdatePresence, useDropPresence } from '@/hooks/useQueries';
import RadarScan from '@/components/discovery/RadarScan';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export default function DiscoveryScreen() {
  const { identity } = useInternetIdentity();
  const {
    connectionState,
    selectedPeer,
    setConnectionState,
    setSelectedPeer,
  } = useLocalNexus();

  const { data: activePeers = 0, isLoading, error, refetch } = useNumActivePeers();
  const updatePresence = useUpdatePresence();
  const dropPresence = useDropPresence();

  const isAuthenticated = !!identity;

  // Update presence when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      updatePresence.mutate();
      const interval = setInterval(() => {
        updatePresence.mutate();
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  // Auto-scan when idle
  useEffect(() => {
    if (connectionState === 'idle' && isAuthenticated) {
      setConnectionState('scanning');
      setTimeout(() => {
        setConnectionState('found');
      }, 2000);
    }
  }, [connectionState, isAuthenticated]);

  const handleRescan = () => {
    setConnectionState('scanning');
    refetch();
    setTimeout(() => {
      setConnectionState('found');
    }, 2000);
  };

  const handleDisconnect = async () => {
    try {
      setConnectionState('idle');
      setSelectedPeer(null);
      await dropPresence.mutateAsync();
    } catch (error) {
      console.error('Failed to drop presence:', error);
      // Still update UI even if backend call fails
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to discover and connect with peers.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Peer Discovery</h2>
        <p className="text-muted-foreground">
          {connectionState === 'scanning' && 'Scanning for online peers...'}
          {connectionState === 'found' && `${activePeers} peer${activePeers !== 1 ? 's' : ''} online`}
          {connectionState === 'connecting' && 'Connecting...'}
          {connectionState === 'connected' && `Connected to ${selectedPeer?.name}`}
          {connectionState === 'disconnected' && 'Connection lost'}
          {connectionState === 'idle' && 'Ready to scan'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load peers. Please try again.
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {(connectionState === 'scanning' || connectionState === 'idle') && (
        <div className="flex justify-center">
          <RadarScan />
        </div>
      )}

      {connectionState === 'found' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : activePeers === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No other peers online. Share this app with friends to connect!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-2 text-lg font-medium">
                  {activePeers} peer{activePeers !== 1 ? 's' : ''} online
                </p>
                <p className="text-sm text-muted-foreground">
                  Peers are currently connected and available for chat and games.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-center">
            <Button onClick={handleRescan} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {connectionState === 'connected' && (
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 text-6xl">✓</div>
            <h3 className="mb-2 text-xl font-semibold">Connected</h3>
            <p className="mb-4 text-muted-foreground">
              You are now connected to {selectedPeer?.name}
            </p>
            <Button onClick={handleDisconnect} variant="outline">
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {connectionState === 'disconnected' && (
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-6">
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-xl font-semibold">Connection Lost</h3>
            <p className="mb-4 text-muted-foreground">
              The connection to {selectedPeer?.name} was lost
            </p>
            <Button onClick={handleRescan}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
