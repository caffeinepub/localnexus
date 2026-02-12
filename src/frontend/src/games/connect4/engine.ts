import type { ConnectFourState, Board, Player } from './types';

const ROWS = 6;
const COLS = 7;

export function createInitialConnectFourState(): ConnectFourState {
  const board: Board = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  return {
    board,
    currentPlayer: 'Red',
    status: 'playing',
    winner: null,
    moveHistory: [],
  };
}

export function makeMove(state: ConnectFourState, column: number): ConnectFourState {
  if (state.status !== 'playing') {
    return state;
  }

  if (column < 0 || column >= COLS) {
    return state;
  }

  // Find the lowest empty row in the column
  let row = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state.board[r][column] === null) {
      row = r;
      break;
    }
  }

  if (row === -1) {
    return state; // Column is full
  }

  const newBoard = state.board.map((r) => [...r]);
  newBoard[row][column] = state.currentPlayer;

  const winner = checkWinner(newBoard, row, column);
  const isDraw = !winner && newBoard[0].every((cell) => cell !== null);

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === 'Red' ? 'Yellow' : 'Red',
    status: winner ? 'won' : isDraw ? 'draw' : 'playing',
    winner,
    moveHistory: [...state.moveHistory, column],
  };
}

function checkWinner(board: Board, row: number, col: number): Player | null {
  const player = board[row][col];
  if (!player) return null;

  // Check horizontal
  let count = 1;
  for (let c = col - 1; c >= 0 && board[row][c] === player; c--) count++;
  for (let c = col + 1; c < COLS && board[row][c] === player; c++) count++;
  if (count >= 4) return player;

  // Check vertical
  count = 1;
  for (let r = row - 1; r >= 0 && board[r][col] === player; r--) count++;
  for (let r = row + 1; r < ROWS && board[r][col] === player; r++) count++;
  if (count >= 4) return player;

  // Check diagonal (top-left to bottom-right)
  count = 1;
  for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r][c] === player; r--, c--) count++;
  for (let r = row + 1, c = col + 1; r < ROWS && c < COLS && board[r][c] === player; r++, c++) count++;
  if (count >= 4) return player;

  // Check diagonal (top-right to bottom-left)
  count = 1;
  for (let r = row - 1, c = col + 1; r >= 0 && c < COLS && board[r][c] === player; r--, c++) count++;
  for (let r = row + 1, c = col - 1; r < ROWS && c >= 0 && board[r][c] === player; r++, c--) count++;
  if (count >= 4) return player;

  return null;
}
