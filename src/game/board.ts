import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  PIECE_LABELS,
  PIECE_NAMES
} from './constants';
import type {
  BoardState,
  Formation,
  Piece,
  PieceType,
  Position,
  SetupOptions,
  Side
} from './types';
import { FORMATION_DEFINITIONS } from './constants';

const BASE_COLUMNS = [1, 2, 6, 7] as const;

function createPiece(side: Side, type: PieceType, index: number): Piece {
  return {
    id: `${side}-${type}-${index}`,
    side,
    type,
    label: PIECE_LABELS[side][type],
    name: PIECE_NAMES[type]
  };
}

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLUMNS }, () => null)
  );
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => row.slice());
}

export function isInsideBoard(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < BOARD_COLUMNS &&
    position.y >= 0 &&
    position.y < BOARD_ROWS
  );
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function getPiece(board: BoardState, position: Position): Piece | null {
  if (!isInsideBoard(position)) {
    return null;
  }

  return board[position.y][position.x];
}

export function setPiece(
  board: BoardState,
  position: Position,
  piece: Piece | null
): void {
  board[position.y][position.x] = piece;
}

function placeBackRank(
  board: BoardState,
  side: Side,
  row: number,
  formation: Formation
): void {
  const sequence = FORMATION_DEFINITIONS[formation].sequence;

  setPiece(board, { x: 0, y: row }, createPiece(side, 'chariot', 0));
  setPiece(board, { x: 8, y: row }, createPiece(side, 'chariot', 1));

  BASE_COLUMNS.forEach((column, index) => {
    setPiece(board, { x: column, y: row }, createPiece(side, sequence[index], index));
  });
}

export function createInitialBoard(setup: SetupOptions): BoardState {
  const board = createEmptyBoard();

  placeBackRank(board, 'red', 0, setup.redFormation);
  setPiece(board, { x: 3, y: 0 }, createPiece('red', 'guard', 0));
  setPiece(board, { x: 5, y: 0 }, createPiece('red', 'guard', 1));
  setPiece(board, { x: 4, y: 1 }, createPiece('red', 'general', 0));
  setPiece(board, { x: 1, y: 2 }, createPiece('red', 'cannon', 0));
  setPiece(board, { x: 7, y: 2 }, createPiece('red', 'cannon', 1));
  [0, 2, 4, 6, 8].forEach((column, index) => {
    setPiece(board, { x: column, y: 3 }, createPiece('red', 'soldier', index));
  });

  placeBackRank(board, 'blue', 9, setup.blueFormation);
  setPiece(board, { x: 3, y: 9 }, createPiece('blue', 'guard', 0));
  setPiece(board, { x: 5, y: 9 }, createPiece('blue', 'guard', 1));
  setPiece(board, { x: 4, y: 8 }, createPiece('blue', 'general', 0));
  setPiece(board, { x: 1, y: 7 }, createPiece('blue', 'cannon', 0));
  setPiece(board, { x: 7, y: 7 }, createPiece('blue', 'cannon', 1));
  [0, 2, 4, 6, 8].forEach((column, index) => {
    setPiece(board, { x: column, y: 6 }, createPiece('blue', 'soldier', index));
  });

  return board;
}

export function findGeneral(board: BoardState, side: Side): Position | null {
  for (let y = 0; y < BOARD_ROWS; y += 1) {
    for (let x = 0; x < BOARD_COLUMNS; x += 1) {
      const piece = board[y][x];
      if (piece?.side === side && piece.type === 'general') {
        return { x, y };
      }
    }
  }

  return null;
}

export function collectPieces(
  board: BoardState,
  side?: Side
): Array<{ piece: Piece; position: Position }> {
  const entries: Array<{ piece: Piece; position: Position }> = [];

  for (let y = 0; y < BOARD_ROWS; y += 1) {
    for (let x = 0; x < BOARD_COLUMNS; x += 1) {
      const piece = board[y][x];
      if (piece && (!side || piece.side === side)) {
        entries.push({ piece, position: { x, y } });
      }
    }
  }

  return entries;
}
