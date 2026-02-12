import type { TicTacToeState, Board, Player, Cell } from './types';

export function createInitialTicTacToeState(): TicTacToeState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    moveHistory: [],
  };
}

export function makeMove(state: TicTacToeState, position: number): TicTacToeState {
  if (state.status !== 'playing') {
    return state;
  }

  if (position < 0 || position > 8 || state.board[position] !== null) {
    return state;
  }

  const newBoard = [...state.board] as Board;
  newBoard[position] = state.currentPlayer;

  const winner = checkWinner(newBoard);
  const isDraw = !winner && newBoard.every((cell) => cell !== null);

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    status: winner ? 'won' : isDraw ? 'draw' : 'playing',
    winner,
    moveHistory: [...state.moveHistory, position],
  };
}

function checkWinner(board: Board): Player | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}
