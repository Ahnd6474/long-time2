import type { Piece } from '../game/types';

interface PieceTokenProps {
  piece: Piece;
  selected: boolean;
  interactive: boolean;
}

export function PieceToken({
  piece,
  selected,
  interactive
}: PieceTokenProps) {
  return (
    <span
      className={[
        'piece-token',
        `piece-token--${piece.side}`,
        selected ? 'piece-token--selected' : '',
        interactive ? 'piece-token--interactive' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="piece-token__glyph">{piece.label}</span>
    </span>
  );
}
