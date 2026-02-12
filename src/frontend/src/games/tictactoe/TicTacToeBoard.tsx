import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useUpdateGameState } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TicTacToeState } from './types';
import { makeMove, createInitialTicTacToeState } from './engine';
import { serializeTicTacToe } from '@/lib/gameSerialization';
import { toast } from 'sonner';

interface TicTacToeBoardProps {
  state: TicTacToeState;
}

export default function TicTacToeBoard({ state }: TicTacToeBoardProps) {
  const { selectedPeer } = useLocalNexus();
  const { identity } = useInternetIdentity();
  const updateGameState = useUpdateGameState();

  const handleCellClick = async (position: number) => {
    if (!selectedPeer || !identity) return;
    
    const newState = makeMove(state, position);
    if (newState === state) return; // Invalid move
    
    try {
      await updateGameState.mutateAsync({
        opponent: selectedPeer.principal,
        newState: serializeTicTacToe(newState),
      });
    } catch (error: any) {
      console.error('Error updating game:', error);
      toast.error(error.message || 'Failed to make move');
    }
  };

  const handleReset = async () => {
    if (!selectedPeer) return;
    
    const newState = createInitialTicTacToeState();
    try {
      await updateGameState.mutateAsync({
        opponent: selectedPeer.principal,
        newState: serializeTicTacToe(newState),
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
          <CardTitle>Tic-Tac-Toe</CardTitle>
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
        <div className="mb-4 grid grid-cols-3 gap-2">
          {state.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={state.status !== 'playing' || cell !== null || updateGameState.isPending}
              className="flex h-20 items-center justify-center rounded-lg border-2 border-border bg-card text-3xl font-bold transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cell}
            </button>
          ))}
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
