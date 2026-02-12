import { useLocalNexus } from '@/state/localNexusStore';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCreateGameChallenge, useAcceptGameChallenge } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GameType } from '@/backend';
import { toast } from 'sonner';

export default function ChallengeBar() {
  const { selectedPeer } = useLocalNexus();
  const { identity } = useInternetIdentity();
  const createChallenge = useCreateGameChallenge();
  const acceptChallenge = useAcceptGameChallenge();

  const handleTicTacToeChallenge = async () => {
    if (!selectedPeer || !identity) return;
    
    try {
      await createChallenge.mutateAsync({
        opponent: selectedPeer.principal,
        gameType: GameType.TicTacToe,
      });
      
      // Auto-accept for demo purposes (in real app, opponent would accept)
      setTimeout(async () => {
        await acceptChallenge.mutateAsync(identity.getPrincipal());
      }, 500);
      
      toast.success('Tic-Tac-Toe game started!');
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'Failed to start game');
    }
  };

  const handleConnectFourChallenge = async () => {
    if (!selectedPeer || !identity) return;
    
    try {
      await createChallenge.mutateAsync({
        opponent: selectedPeer.principal,
        gameType: GameType.ConnectFour,
      });
      
      // Auto-accept for demo purposes (in real app, opponent would accept)
      setTimeout(async () => {
        await acceptChallenge.mutateAsync(identity.getPrincipal());
      }, 500);
      
      toast.success('Connect Four game started!');
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'Failed to start game');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={createChallenge.isPending}>
          <Gamepad2 className="mr-2 h-4 w-4" />
          Challenge
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleTicTacToeChallenge}>
          Start Tic-Tac-Toe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleConnectFourChallenge}>
          Start Connect Four
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
