import type { TicTacToeState } from '@/games/tictactoe/types';
import type { ConnectFourState } from '@/games/connect4/types';

export function serializeTicTacToe(state: TicTacToeState): string {
  return JSON.stringify(state);
}

export function deserializeTicTacToe(stateStr: string): TicTacToeState | null {
  try {
    const parsed = JSON.parse(stateStr);
    if (!parsed.board || !Array.isArray(parsed.board)) {
      return null;
    }
    return parsed as TicTacToeState;
  } catch (error) {
    console.error('Error deserializing TicTacToe state:', error);
    return null;
  }
}

export function serializeConnectFour(state: ConnectFourState): string {
  return JSON.stringify(state);
}

export function deserializeConnectFour(stateStr: string): ConnectFourState | null {
  try {
    const parsed = JSON.parse(stateStr);
    if (!parsed.board || !Array.isArray(parsed.board)) {
      return null;
    }
    return parsed as ConnectFourState;
  } catch (error) {
    console.error('Error deserializing ConnectFour state:', error);
    return null;
  }
}
