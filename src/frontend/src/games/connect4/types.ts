export type Player = 'Red' | 'Yellow';
export type Cell = Player | null;
export type Board = Cell[][];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface ConnectFourState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moveHistory: number[];
}
