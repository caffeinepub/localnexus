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
import { createInitialTicTacToeState } from '@/games/tictactoe/engine';
import { createInitialConnectFourState } from '@/games/connect4/engine';
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
            Please log in to play games with peers.
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

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && !gameState && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Game</CardTitle>
            <CardDescription>
              Start a new game by sending a challenge from the Chat screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-2">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src="/assets/generated/icon-tictactoe.dim_256x256.png"
                      alt="Tic-Tac-Toe"
                      className="h-16 w-16"
                    />
                  </div>
                  <CardTitle className="text-center">Tic-Tac-Toe</CardTitle>
                  <CardDescription className="text-center">
                    Classic 3x3 grid game
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src="/assets/generated/icon-connect4.dim_256x256.png"
                      alt="Connect Four"
                      className="h-16 w-16"
                    />
                  </div>
                  <CardTitle className="text-center">Connect Four</CardTitle>
                  <CardDescription className="text-center">
                    Connect four in a row to win
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && gameState && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {gameState.gameType === GameType.TicTacToe ? 'Tic-Tac-Toe' : 'Connect Four'}
                  </CardTitle>
                  <CardDescription>
                    {gameState.winner
                      ? `Winner: ${
                          gameState.winner.toString() === identity?.getPrincipal().toString()
                            ? 'You'
                            : selectedPeer.name
                        }`
                      : `Current turn: ${
                          gameState.currentTurn.toString() === identity?.getPrincipal().toString()
                            ? 'Your turn'
                            : `${selectedPeer.name}'s turn`
                        }`}
                  </CardDescription>
                </div>
                {gameState.winner && (
                  <Badge variant="secondary" className="text-lg">
                    Game Over
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {gameState.gameType === GameType.TicTacToe && (
                <TicTacToeBoard
                  state={deserializeTicTacToe(gameState.state) || createInitialTicTacToeState()}
                />
              )}
              {gameState.gameType === GameType.ConnectFour && (
                <ConnectFourBoard
                  state={deserializeConnectFour(gameState.state) || createInitialConnectFourState()}
                />
              )}
            </CardContent>
          </Card>

          <GameStateDebugPanel state={gameState} />
        </div>
      )}
    </div>
  );
}
