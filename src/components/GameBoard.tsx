import type { BoardState, MoveCandidate, Position, Side } from '../game/types';
import { getPiece, positionsEqual } from '../game/board';
import { PieceToken } from './PieceToken';

interface GameBoardProps {
  board: BoardState;
  turn: Side;
  selected: Position | null;
  legalMoves: MoveCandidate[];
  onPointClick: (position: Position) => void;
  disabled: boolean;
}

function buildAriaLabel(
  pieceName: string | undefined,
  position: Position,
  turn: Side,
  isSelectable: boolean,
  isCapture: boolean
): string {
  const coordinate = `${String.fromCharCode(65 + position.x)}${position.y + 1}`;

  if (!pieceName) {
    return isCapture ? `${coordinate}, capture target` : `${coordinate}, empty point`;
  }

  const pieceText = `${pieceName} on ${coordinate}`;

  if (!isSelectable) {
    return pieceText;
  }

  return `${pieceText}, ${turn} piece`;
}

export function GameBoard({
  board,
  turn,
  selected,
  legalMoves,
  onPointClick,
  disabled
}: GameBoardProps) {
  const moveMap = new Map(
    legalMoves.map((move) => [`${move.to.x},${move.to.y}`, move] as const)
  );

  return (
    <div className="board-card">
      <div className="board-surface">
        <svg
          className="board-gridlines"
          viewBox="0 0 9 10"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }, (_, row) => (
            <line
              key={`h-${row}`}
              x1="0.5"
              y1={row + 0.5}
              x2="8.5"
              y2={row + 0.5}
            />
          ))}
          {Array.from({ length: 9 }, (_, column) => (
            <line
              key={`v-${column}`}
              x1={column + 0.5}
              y1="0.5"
              x2={column + 0.5}
              y2="9.5"
            />
          ))}
          <line x1="3.5" y1="0.5" x2="4.5" y2="1.5" />
          <line x1="4.5" y1="1.5" x2="5.5" y2="2.5" />
          <line x1="5.5" y1="0.5" x2="4.5" y2="1.5" />
          <line x1="4.5" y1="1.5" x2="3.5" y2="2.5" />
          <line x1="3.5" y1="7.5" x2="4.5" y2="8.5" />
          <line x1="4.5" y1="8.5" x2="5.5" y2="9.5" />
          <line x1="5.5" y1="7.5" x2="4.5" y2="8.5" />
          <line x1="4.5" y1="8.5" x2="3.5" y2="9.5" />
        </svg>

        <div className="board-points" role="grid" aria-label="Janggi board">
          {Array.from({ length: 10 }, (_, y) =>
            Array.from({ length: 9 }, (_, x) => {
              const position = { x, y };
              const piece = getPiece(board, position);
              const move = moveMap.get(`${x},${y}`) ?? null;
              const isSelected = selected ? positionsEqual(selected, position) : false;
              const isSelectable = piece?.side === turn && !disabled;

              return (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  role="gridcell"
                  className={[
                    'board-point',
                    isSelected ? 'board-point--selected' : '',
                    move && !move.isCapture ? 'board-point--legal' : '',
                    move?.isCapture ? 'board-point--capture' : '',
                    isSelectable ? 'board-point--selectable' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onPointClick(position)}
                  disabled={disabled}
                  aria-label={buildAriaLabel(
                    piece?.name,
                    position,
                    turn,
                    Boolean(isSelectable),
                    Boolean(move?.isCapture)
                  )}
                  aria-pressed={isSelected}
                >
                  {move && !move.isCapture ? <span className="board-point__dot" /> : null}
                  {move?.isCapture ? <span className="board-point__ring" /> : null}
                  {piece ? (
                    <PieceToken
                      piece={piece}
                      selected={isSelected}
                      interactive={Boolean(isSelectable)}
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
