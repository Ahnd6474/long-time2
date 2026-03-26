import { PIECE_NAMES, SIDE_NAMES } from './constants';
import type { PieceType, Position, Side } from './types';

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export function formatPosition(position: Position): string {
  return `${FILES[position.x]}${position.y + 1}`;
}

export function describeMove(options: {
  side: Side;
  pieceType?: PieceType;
  from?: Position;
  to?: Position;
  capturedType?: PieceType;
  pass?: boolean;
}): string {
  const sideName = SIDE_NAMES[options.side];

  if (options.pass) {
    return `${sideName} passed`;
  }

  if (!options.pieceType || !options.from || !options.to) {
    return `${sideName} moved`;
  }

  const captureText = options.capturedType
    ? ` and captured ${PIECE_NAMES[options.capturedType]}`
    : '';

  return `${sideName} ${PIECE_NAMES[options.pieceType]} ${formatPosition(
    options.from
  )} to ${formatPosition(options.to)}${captureText}`;
}
