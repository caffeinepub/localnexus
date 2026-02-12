import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetGameState } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TicTacToeBoard from '@/games/tictactoe/TicTacToeBoard';
import ConnectFourBoard from '@/games/connect4/ConnectFourBoard';
import GameStateDebugPanel from '@/components/games/GameStateDebugPanel';
import { deserializeTicTacToe, deserializeConnectFour } from '@/lib/gameSerialization';
import { GameType } from '@/backend';

export default function GamesScreen() {
  const { identity } = useInternetIdentity();
  const { selectedPeer } = useLocalNexus();
  const { data: gameState, isLoading, error } = useGetGameState(selectedPeer?.principal || null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please login to play games with peers.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedPeer) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Connect to a peer from the Discovery screen to start playing games.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Mini-Games</h2>
        <p className="text-muted-foreground">
          Challenge {selectedPeer.name} to a game
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load game state. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Game Library */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <img
                src="/assets/generated/icon-tictactoe.dim_256x256.png"
                alt="Tic-Tac-Toe"
                className="h-16 w-16"
              />
              <Badge variant="secondary">Turn-based</Badge>
            </div>
            <CardTitle>Tic-Tac-Toe</CardTitle>
            <CardDescription>
              Classic 3x3 grid game. Get three in a row to win!
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 flex items-center justify-between">
              <img
                src="/assets/generated/icon-connect4.dim_256x256.png"
                alt="Connect Four"
                className="h-16 w-16"
              />
              <Badge variant="secondary">Turn-based</Badge>
            </div>
            <CardTitle>Connect Four</CardTitle>
            <CardDescription>
              Drop discs and connect four in a row to win!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Active Game */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <Skeleton className="mx-auto h-64 w-full max-w-md" />
          </CardContent>
        </Card>
      )}

      {!isLoading && gameState && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-2xl font-semibold">Active Game</h3>
            
            {gameState.gameType === GameType.TicTacToe && (() => {
              const state = deserializeTicTacToe(gameState.state);
              if (!state) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load game state. The game data may be corrupted.
                    </AlertDescription>
                  </Alert>
                );
              }
              return (
                <div className="grid gap-6 lg:grid-cols-2">
                  <TicTacToeBoard state={state} />
                  <GameStateDebugPanel state={state} />
                </div>
              );
            })()}

            {gameState.gameType === GameType.ConnectFour && (() => {
              const state = deserializeConnectFour(gameState.state);
              if (!state) {
                return (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load game state. The game data may be corrupted.
                    </AlertDescription>
                  </Alert>
                );
              }
              return (
                <div className="grid gap-6 lg:grid-cols-2">
                  <ConnectFourBoard state={state} />
                  <GameStateDebugPanel state={state} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {!isLoading && !gameState && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No active game. Start a challenge from the Chat screen!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
