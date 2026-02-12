import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useUpdateGameState } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ConnectFourState } from './types';
import { makeMove, createInitialConnectFourState } from './engine';
import { serializeConnectFour } from '@/lib/gameSerialization';
import { toast } from 'sonner';

interface ConnectFourBoardProps {
  state: ConnectFourState;
}

export default function ConnectFourBoard({ state }: ConnectFourBoardProps) {
  const { selectedPeer } = useLocalNexus();
  const { identity } = useInternetIdentity();
  const updateGameState = useUpdateGameState();

  const handleColumnClick = async (column: number) => {
    if (!selectedPeer || !identity) return;
    
    const newState = makeMove(state, column);
    if (newState === state) return; // Invalid move
    
    try {
      await updateGameState.mutateAsync({
        opponent: selectedPeer.principal,
        newState: serializeConnectFour(newState),
      });
    } catch (error: any) {
      console.error('Error updating game:', error);
      toast.error(error.message || 'Failed to make move');
    }
  };

  const handleReset = async () => {
    if (!selectedPeer) return;
    
    const newState = createInitialConnectFourState();
    try {
      await updateGameState.mutateAsync({
        opponent: selectedPeer.principal,
        newState: serializeConnectFour(newState),
      });
    } catch (error: any) {
      console.error('Error resetting game:', error);
      toast.error(error.message || 'Failed to reset game');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connect Four</CardTitle>
          {state.status === 'playing' && (
            <Badge>Current: {state.currentPlayer}</Badge>
          )}
          {state.status === 'won' && (
            <Badge variant="secondary">Winner: {state.winner}</Badge>
          )}
          {state.status === 'draw' && (
            <Badge variant="outline">Draw</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-1">
          {/* Column buttons */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <button
                key={col}
                onClick={() => handleColumnClick(col)}
                disabled={state.status !== 'playing' || state.board[0][col] !== null || updateGameState.isPending}
                className="h-8 rounded-t-lg bg-primary/20 transition-all hover:bg-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Drop in column ${col + 1}`}
              />
            ))}
          </div>

          {/* Board */}
          <div className="rounded-lg bg-primary/10 p-2">
            <div className="grid grid-cols-7 gap-1">
              {state.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="flex h-12 items-center justify-center rounded-full bg-background"
                  >
                    {cell && (
                      <div
                        className={`h-10 w-10 rounded-full ${
                          cell === 'Red' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {state.status !== 'playing' && (
          <Button onClick={handleReset} className="w-full" disabled={updateGameState.isPending}>
            {updateGameState.isPending ? 'Resetting...' : 'Play Again'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
