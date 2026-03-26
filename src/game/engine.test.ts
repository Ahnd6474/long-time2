import { describe, expect, it } from 'vitest';
import { createEmptyBoard, getPiece, setPiece } from './board';
import { DEFAULT_SETUP, PIECE_LABELS, PIECE_NAMES } from './constants';
import {
  areGeneralsFacing,
  createGame,
  getLegalMoves,
  getTurnContext,
  movePiece,
  passTurn
} from './engine';
import type { GameState, Piece, PieceType, Position, Side } from './types';

function makePiece(side: Side, type: PieceType, id = `${side}-${type}`): Piece {
  return {
    id,
    side,
    type,
    label: PIECE_LABELS[side][type],
    name: PIECE_NAMES[type]
  };
}

function makeGame(turn: Side = 'blue'): GameState {
  return {
    board: createEmptyBoard(),
    turn,
    winner: null,
    drawReason: null,
    previousWasPass: false,
    moveHistory: [],
    setup: DEFAULT_SETUP,
    history: []
  };
}

function place(game: GameState, side: Side, type: PieceType, x: number, y: number): void {
  setPiece(game.board, { x, y }, makePiece(side, type, `${side}-${type}-${x}-${y}`));
}

function toKeys(positions: Position[]) {
  return positions.map((position) => `${position.x},${position.y}`).sort();
}

describe('Janggi rules engine', () => {
  it('creates the default board with 32 pieces and blue to move', () => {
    const game = createGame();
    const pieces = game.board.flat().filter(Boolean);

    expect(game.turn).toBe('blue');
    expect(pieces).toHaveLength(32);
    expect(getPiece(game.board, { x: 4, y: 8 })?.type).toBe('general');
    expect(getPiece(game.board, { x: 4, y: 1 })?.type).toBe('general');
    expect(getPiece(game.board, { x: 1, y: 9 })?.type).toBe('elephant');
    expect(getPiece(game.board, { x: 2, y: 9 })?.type).toBe('horse');
  });

  it('blocks horse routes when the first leg is occupied', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'blue', 'horse', 4, 4);
    place(game, 'blue', 'soldier', 5, 4);

    const moves = getLegalMoves(game, { x: 4, y: 4 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).not.toContain('6,3');
    expect(keys).not.toContain('6,5');
    expect(keys).toEqual(['2,3', '2,5', '3,2', '3,6', '5,2', '5,6']);
  });

  it('blocks elephant routes on either intermediate point', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'blue', 'elephant', 4, 4);
    place(game, 'blue', 'soldier', 6, 5);

    const moves = getLegalMoves(game, { x: 4, y: 4 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).not.toContain('7,6');
    expect(keys).toContain('7,2');
    expect(keys).toContain('1,6');
    expect(keys).toContain('1,2');
  });

  it('requires a hurdle for cannon moves and forbids capturing another cannon', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'blue', 'cannon', 4, 4);
    place(game, 'blue', 'soldier', 4, 5);
    place(game, 'red', 'guard', 4, 7);
    place(game, 'blue', 'guard', 5, 4);
    place(game, 'red', 'cannon', 7, 4);

    const moves = getLegalMoves(game, { x: 4, y: 4 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).toContain('4,6');
    expect(keys).toContain('4,7');
    expect(keys).not.toContain('7,4');
    expect(keys).not.toContain('4,3');
  });

  it('allows palace diagonals for soldiers without allowing backward moves', () => {
    const game = makeGame('red');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'red', 'soldier', 3, 7);

    const moves = getLegalMoves(game, { x: 3, y: 7 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).toContain('2,7');
    expect(keys).toContain('3,8');
    expect(keys).toContain('4,8');
    expect(keys).not.toContain('3,6');
    expect(keys).not.toContain('4,6');
  });

  it('lets chariots travel along palace diagonals', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'blue', 'chariot', 3, 7);

    const moves = getLegalMoves(game, { x: 3, y: 7 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).toContain('4,8');
    expect(keys).toContain('5,9');
  });

  it('rejects moves that expose the general to check', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 4, 8);
    place(game, 'red', 'chariot', 4, 3);
    place(game, 'blue', 'soldier', 4, 6);

    const moves = getLegalMoves(game, { x: 4, y: 6 });
    const keys = toKeys(moves.map((move) => move.to));

    expect(keys).toEqual(['4,5']);
  });

  it('applies captures and records the move', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 3, 1);
    place(game, 'blue', 'general', 5, 8);
    place(game, 'blue', 'chariot', 0, 4);
    place(game, 'red', 'soldier', 0, 6);

    const nextGame = movePiece(game, { x: 0, y: 4 }, { x: 0, y: 6 });

    expect(getPiece(nextGame.board, { x: 0, y: 6 })?.side).toBe('blue');
    expect(getPiece(nextGame.board, { x: 0, y: 4 })).toBeNull();
    expect(nextGame.moveHistory).toHaveLength(1);
    expect(nextGame.turn).toBe('red');
  });

  it('treats a face-off pass as a bikjang draw claim', () => {
    const game = makeGame('blue');
    place(game, 'red', 'general', 4, 1);
    place(game, 'blue', 'general', 4, 8);

    expect(areGeneralsFacing(game.board)).toBe(true);
    expect(getTurnContext(game).faceOff).toBe(true);

    const nextGame = passTurn(game);

    expect(nextGame.drawReason).toBe('Draw claimed through bikjang.');
  });
});
