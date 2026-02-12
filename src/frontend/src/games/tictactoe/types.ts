export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface TicTacToeState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moveHistory: number[];
}
