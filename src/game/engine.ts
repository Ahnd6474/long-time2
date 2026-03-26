import { DEFAULT_SETUP, SIDE_NAMES } from './constants';
import {
  cloneBoard,
  collectPieces,
  createInitialBoard,
  findGeneral,
  getPiece,
  isInsideBoard,
  positionsEqual,
  setPiece
} from './board';
import { describeMove } from './notation';
import { getDiagonalLinesForPosition, getPalaceNeighbors } from './palace';
import type {
  BoardState,
  GameSnapshot,
  GameState,
  MoveCandidate,
  Piece,
  Position,
  SetupOptions,
  Side,
  TurnContext,
  TurnRecord
} from './types';

function otherSide(side: Side): Side {
  return side === 'blue' ? 'red' : 'blue';
}

function forwardDelta(side: Side): number {
  return side === 'red' ? 1 : -1;
}

function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function uniquePositions(positions: Position[]): Position[] {
  const seen = new Set<string>();
  const unique: Position[] = [];

  positions.forEach((position) => {
    const key = `${position.x},${position.y}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(position);
    }
  });

  return unique;
}

function createSnapshot(game: GameState): GameSnapshot {
  return {
    board: cloneBoard(game.board),
    turn: game.turn,
    winner: game.winner,
    drawReason: game.drawReason,
    previousWasPass: game.previousWasPass,
    moveHistory: [...game.moveHistory],
    setup: { ...game.setup }
  };
}

function createRecord(
  game: GameState,
  record: Omit<TurnRecord, 'id' | 'moveNumber'>
): TurnRecord {
  const moveNumber = game.moveHistory.length + 1;
  return {
    ...record,
    id: `turn-${moveNumber}`,
    moveNumber
  };
}

function addStepMove(
  board: BoardState,
  piece: Piece,
  target: Position,
  results: Position[]
): void {
  if (!isInsideBoard(target)) {
    return;
  }

  const occupant = getPiece(board, target);
  if (!occupant || occupant.side !== piece.side) {
    results.push(target);
  }
}

function slideOrthogonal(
  board: BoardState,
  piece: Piece,
  origin: Position,
  results: Position[]
): void {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  directions.forEach((direction) => {
    let next = { x: origin.x + direction.x, y: origin.y + direction.y };

    while (isInsideBoard(next)) {
      const occupant = getPiece(board, next);
      if (!occupant) {
        results.push({ ...next });
        next = { x: next.x + direction.x, y: next.y + direction.y };
        continue;
      }

      if (occupant.side !== piece.side) {
        results.push({ ...next });
      }
      break;
    }
  });
}

function slidePalaceDiagonals(
  board: BoardState,
  piece: Piece,
  origin: Position,
  results: Position[]
): void {
  const lines = getDiagonalLinesForPosition(origin);

  lines.forEach((line) => {
    const index = line.findIndex((position) => samePosition(position, origin));
    if (index === -1) {
      return;
    }

    [-1, 1].forEach((direction) => {
      for (
        let cursor = index + direction;
        cursor >= 0 && cursor < line.length;
        cursor += direction
      ) {
        const target = line[cursor];
        const occupant = getPiece(board, target);

        if (!occupant) {
          results.push({ ...target });
          continue;
        }

        if (occupant.side !== piece.side) {
          results.push({ ...target });
        }
        break;
      }
    });
  });
}

function cannonOrthogonalMoves(
  board: BoardState,
  piece: Piece,
  origin: Position,
  results: Position[]
): void {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  directions.forEach((direction) => {
    let cursor = { x: origin.x + direction.x, y: origin.y + direction.y };
    let hurdle: Piece | null = null;

    while (isInsideBoard(cursor)) {
      const occupant = getPiece(board, cursor);

      if (!hurdle) {
        if (occupant) {
          if (occupant.type === 'cannon') {
            return;
          }

          hurdle = occupant;
        }
        cursor = { x: cursor.x + direction.x, y: cursor.y + direction.y };
        continue;
      }

      if (!occupant) {
        results.push({ ...cursor });
        cursor = { x: cursor.x + direction.x, y: cursor.y + direction.y };
        continue;
      }

      if (occupant.type !== 'cannon' && occupant.side !== piece.side) {
        results.push({ ...cursor });
      }
      return;
    }
  });
}

function cannonPalaceMoves(
  board: BoardState,
  piece: Piece,
  origin: Position,
  results: Position[]
): void {
  const lines = getDiagonalLinesForPosition(origin);

  lines.forEach((line) => {
    const index = line.findIndex((position) => samePosition(position, origin));
    if (index !== 0 && index !== 2) {
      return;
    }

    const hurdlePosition = line[1];
    const destination = line[index === 0 ? 2 : 0];
    const hurdle = getPiece(board, hurdlePosition);

    if (!hurdle || hurdle.type === 'cannon') {
      return;
    }

    const occupant = getPiece(board, destination);
    if (!occupant) {
      results.push({ ...destination });
      return;
    }

    if (occupant.type !== 'cannon' && occupant.side !== piece.side) {
      results.push({ ...destination });
    }
  });
}

function horseMoves(board: BoardState, piece: Piece, origin: Position): Position[] {
  const results: Position[] = [];
  const patterns = [
    {
      leg: { x: 1, y: 0 },
      targets: [
        { x: 2, y: 1 },
        { x: 2, y: -1 }
      ]
    },
    {
      leg: { x: -1, y: 0 },
      targets: [
        { x: -2, y: 1 },
        { x: -2, y: -1 }
      ]
    },
    {
      leg: { x: 0, y: 1 },
      targets: [
        { x: 1, y: 2 },
        { x: -1, y: 2 }
      ]
    },
    {
      leg: { x: 0, y: -1 },
      targets: [
        { x: 1, y: -2 },
        { x: -1, y: -2 }
      ]
    }
  ];

  patterns.forEach((pattern) => {
    const legPosition = { x: origin.x + pattern.leg.x, y: origin.y + pattern.leg.y };
    if (getPiece(board, legPosition)) {
      return;
    }

    pattern.targets.forEach((offset) => {
      addStepMove(
        board,
        piece,
        { x: origin.x + offset.x, y: origin.y + offset.y },
        results
      );
    });
  });

  return results;
}

function elephantMoves(board: BoardState, piece: Piece, origin: Position): Position[] {
  const results: Position[] = [];
  const patterns = [
    {
      leg: { x: 1, y: 0 },
      diagonals: [
        { x: 2, y: 1, destination: { x: 3, y: 2 } },
        { x: 2, y: -1, destination: { x: 3, y: -2 } }
      ]
    },
    {
      leg: { x: -1, y: 0 },
      diagonals: [
        { x: -2, y: 1, destination: { x: -3, y: 2 } },
        { x: -2, y: -1, destination: { x: -3, y: -2 } }
      ]
    },
    {
      leg: { x: 0, y: 1 },
      diagonals: [
        { x: 1, y: 2, destination: { x: 2, y: 3 } },
        { x: -1, y: 2, destination: { x: -2, y: 3 } }
      ]
    },
    {
      leg: { x: 0, y: -1 },
      diagonals: [
        { x: 1, y: -2, destination: { x: 2, y: -3 } },
        { x: -1, y: -2, destination: { x: -2, y: -3 } }
      ]
    }
  ];

  patterns.forEach((pattern) => {
    const legPosition = { x: origin.x + pattern.leg.x, y: origin.y + pattern.leg.y };
    if (getPiece(board, legPosition)) {
      return;
    }

    pattern.diagonals.forEach((diagonal) => {
      const diagonalPosition = { x: origin.x + diagonal.x, y: origin.y + diagonal.y };
      if (getPiece(board, diagonalPosition)) {
        return;
      }

      addStepMove(
        board,
        piece,
        {
          x: origin.x + diagonal.destination.x,
          y: origin.y + diagonal.destination.y
        },
        results
      );
    });
  });

  return results;
}

function generalOrGuardMoves(
  board: BoardState,
  piece: Piece,
  origin: Position
): Position[] {
  const results: Position[] = [];

  getPalaceNeighbors(origin).forEach((target) => {
    addStepMove(board, piece, target, results);
  });

  return results;
}

function soldierMoves(board: BoardState, piece: Piece, origin: Position): Position[] {
  const results: Position[] = [];
  const delta = forwardDelta(piece.side);

  addStepMove(board, piece, { x: origin.x, y: origin.y + delta }, results);
  addStepMove(board, piece, { x: origin.x - 1, y: origin.y }, results);
  addStepMove(board, piece, { x: origin.x + 1, y: origin.y }, results);

  getPalaceNeighbors(origin)
    .filter((target) => Math.abs(target.x - origin.x) === 1)
    .filter((target) => target.y - origin.y === delta)
    .forEach((target) => addStepMove(board, piece, target, results));

  return results;
}

export function generatePseudoMoves(board: BoardState, origin: Position): Position[] {
  const piece = getPiece(board, origin);
  if (!piece) {
    return [];
  }

  let moves: Position[] = [];

  switch (piece.type) {
    case 'general':
    case 'guard':
      moves = generalOrGuardMoves(board, piece, origin);
      break;
    case 'horse':
      moves = horseMoves(board, piece, origin);
      break;
    case 'elephant':
      moves = elephantMoves(board, piece, origin);
      break;
    case 'chariot':
      slideOrthogonal(board, piece, origin, moves);
      slidePalaceDiagonals(board, piece, origin, moves);
      break;
    case 'cannon':
      cannonOrthogonalMoves(board, piece, origin, moves);
      cannonPalaceMoves(board, piece, origin, moves);
      break;
    case 'soldier':
      moves = soldierMoves(board, piece, origin);
      break;
    default:
      moves = [];
  }

  return uniquePositions(moves);
}

export function isSquareAttacked(
  board: BoardState,
  target: Position,
  bySide: Side
): boolean {
  return collectPieces(board, bySide).some(({ position }) =>
    generatePseudoMoves(board, position).some((candidate) => positionsEqual(candidate, target))
  );
}

export function areGeneralsFacing(board: BoardState): boolean {
  const redGeneral = findGeneral(board, 'red');
  const blueGeneral = findGeneral(board, 'blue');

  if (!redGeneral || !blueGeneral || redGeneral.x !== blueGeneral.x) {
    return false;
  }

  const start = Math.min(redGeneral.y, blueGeneral.y) + 1;
  const end = Math.max(redGeneral.y, blueGeneral.y);

  for (let y = start; y < end; y += 1) {
    if (board[y][redGeneral.x]) {
      return false;
    }
  }

  return true;
}

export function isInCheck(board: BoardState, side: Side): boolean {
  const generalPosition = findGeneral(board, side);
  if (!generalPosition) {
    return true;
  }

  return isSquareAttacked(board, generalPosition, otherSide(side));
}

function applyMoveToBoard(
  board: BoardState,
  from: Position,
  to: Position
): { board: BoardState; captured: Piece | null } {
  const nextBoard = cloneBoard(board);
  const movingPiece = getPiece(nextBoard, from);
  const captured = getPiece(nextBoard, to);

  if (!movingPiece) {
    return { board: nextBoard, captured: null };
  }

  setPiece(nextBoard, from, null);
  setPiece(nextBoard, to, movingPiece);

  return { board: nextBoard, captured };
}

function legalMovesForSide(
  board: BoardState,
  side: Side
): MoveCandidate[] {
  const faceOff = areGeneralsFacing(board);
  const moves: MoveCandidate[] = [];

  collectPieces(board, side).forEach(({ piece, position }) => {
    generatePseudoMoves(board, position).forEach((target) => {
      const { board: nextBoard, captured } = applyMoveToBoard(board, position, target);

      if (isInCheck(nextBoard, side)) {
        return;
      }

      if (faceOff && areGeneralsFacing(nextBoard)) {
        return;
      }

      moves.push({
        from: position,
        to: target,
        piece,
        captured,
        isCapture: Boolean(captured)
      });
    });
  });

  return moves;
}

export function getLegalMoves(game: GameState, origin: Position): MoveCandidate[] {
  if (game.winner || game.drawReason) {
    return [];
  }

  const piece = getPiece(game.board, origin);
  if (!piece || piece.side !== game.turn) {
    return [];
  }

  return legalMovesForSide(game.board, game.turn).filter(({ from }) =>
    positionsEqual(from, origin)
  );
}

export function getAllLegalMoves(game: GameState): MoveCandidate[] {
  if (game.winner || game.drawReason) {
    return [];
  }

  return legalMovesForSide(game.board, game.turn);
}

export function getTurnContext(game: GameState): TurnContext {
  if (game.winner) {
    return {
      check: false,
      faceOff: false,
      availableMoves: 0,
      canPass: false,
      status: `${SIDE_NAMES[game.winner]} wins by checkmate.`
    };
  }

  if (game.drawReason) {
    return {
      check: false,
      faceOff: false,
      availableMoves: 0,
      canPass: false,
      status: game.drawReason
    };
  }

  const check = isInCheck(game.board, game.turn);
  const faceOff = areGeneralsFacing(game.board);
  const availableMoves = legalMovesForSide(game.board, game.turn).length;
  const canPass = !check;

  let status = `${SIDE_NAMES[game.turn]} to move.`;

  if (check && faceOff) {
    status = `${SIDE_NAMES[game.turn]} is in check and must break the face-off.`;
  } else if (check) {
    status = `${SIDE_NAMES[game.turn]} is in check.`;
  } else if (faceOff) {
    status = `Bikjang: ${SIDE_NAMES[game.turn]} must break the face-off or claim a draw.`;
  } else if (availableMoves === 0) {
    status = `${SIDE_NAMES[game.turn]} has no legal move and may pass.`;
  }

  return {
    check,
    faceOff,
    availableMoves,
    canPass,
    status
  };
}

function finalizeAfterMove(game: GameState, movingSide: Side): GameState {
  if (game.winner || game.drawReason) {
    return game;
  }

  const context = getTurnContext(game);
  if (context.check && context.availableMoves === 0) {
    return {
      ...game,
      winner: movingSide
    };
  }

  return game;
}

export function createGame(setup: SetupOptions = DEFAULT_SETUP): GameState {
  return {
    board: createInitialBoard(setup),
    turn: 'blue',
    winner: null,
    drawReason: null,
    previousWasPass: false,
    moveHistory: [],
    setup: { ...setup },
    history: []
  };
}

export function movePiece(game: GameState, from: Position, to: Position): GameState {
  if (game.winner || game.drawReason) {
    return game;
  }

  const legalMove = getLegalMoves(game, from).find(({ to: target }) => positionsEqual(target, to));
  if (!legalMove) {
    return game;
  }

  const snapshot = createSnapshot(game);
  const { board, captured } = applyMoveToBoard(game.board, from, to);
  const record = createRecord(game, {
    side: game.turn,
    summary: describeMove({
      side: game.turn,
      pieceType: legalMove.piece.type,
      from,
      to,
      capturedType: captured?.type
    }),
    pass: false,
    pieceType: legalMove.piece.type,
    from,
    to,
    capturedType: captured?.type
  });

  const nextGame: GameState = {
    ...game,
    board,
    turn: otherSide(game.turn),
    winner: captured?.type === 'general' ? game.turn : null,
    drawReason: null,
    previousWasPass: false,
    moveHistory: [...game.moveHistory, record],
    history: [...game.history, snapshot]
  };

  return finalizeAfterMove(nextGame, legalMove.piece.side);
}

export function passTurn(game: GameState): GameState {
  if (game.winner || game.drawReason) {
    return game;
  }

  const context = getTurnContext(game);
  if (!context.canPass) {
    return game;
  }

  const snapshot = createSnapshot(game);
  const drawReason = context.faceOff
    ? 'Draw claimed through bikjang.'
    : game.previousWasPass
      ? 'Draw after two consecutive passes.'
      : null;

  const record = createRecord(game, {
    side: game.turn,
    summary: describeMove({
      side: game.turn,
      pass: true
    }),
    pass: true
  });

  return {
    ...game,
    turn: otherSide(game.turn),
    drawReason,
    previousWasPass: true,
    moveHistory: [...game.moveHistory, record],
    history: [...game.history, snapshot]
  };
}

export function undoGame(game: GameState): GameState {
  const previous = game.history[game.history.length - 1];
  if (!previous) {
    return game;
  }

  return {
    ...previous,
    board: cloneBoard(previous.board),
    moveHistory: [...previous.moveHistory],
    setup: { ...previous.setup },
    history: game.history.slice(0, -1)
  };
}

export function resetGame(game: GameState): GameState {
  return createGame(game.setup);
}
