import { FORMATION_DEFINITIONS, PIECE_NAMES, SIDE_NAMES } from '../game/constants';
import type {
  Formation,
  GameState,
  Piece,
  SetupOptions,
  Side,
  TurnContext
} from '../game/types';

interface SidePanelProps {
  game: GameState;
  context: TurnContext;
  setupDraft: SetupOptions;
  selectedPiece: Piece | null;
  selectedMoveCount: number;
  onSetupChange: (side: Side, formation: Formation) => void;
  onNewGame: () => void;
  onReset: () => void;
  onUndo: () => void;
  onPass: () => void;
  onHelp: () => void;
}

function pairMoves(game: GameState) {
  const pairs: Array<{ index: number; blue?: string; red?: string }> = [];

  game.moveHistory.forEach((record) => {
    const pairIndex = Math.floor((record.moveNumber - 1) / 2);

    if (!pairs[pairIndex]) {
      pairs[pairIndex] = { index: pairIndex + 1 };
    }

    if (record.side === 'blue') {
      pairs[pairIndex].blue = record.summary;
    } else {
      pairs[pairIndex].red = record.summary;
    }
  });

  return pairs;
}

export function SidePanel({
  game,
  context,
  setupDraft,
  selectedPiece,
  selectedMoveCount,
  onSetupChange,
  onNewGame,
  onReset,
  onUndo,
  onPass,
  onHelp
}: SidePanelProps) {
  const movePairs = pairMoves(game);
  const passLabel = context.faceOff ? 'Claim draw' : 'Pass turn';
  const canUndo = game.history.length > 0;
  const gameEnded = Boolean(game.winner || game.drawReason);

  return (
    <aside className="side-panel">
      <section className="panel-card panel-card--status">
        <div className="panel-card__header">
          <div>
            <p className="panel-card__eyebrow">Match status</p>
            <h2>Current board</h2>
          </div>
          <span className={`turn-badge turn-badge--${game.turn}`}>
            {SIDE_NAMES[game.turn]}
          </span>
        </div>

        <p className="status-copy">{context.status}</p>

        <dl className="status-grid">
          <div>
            <dt>Turn</dt>
            <dd>{SIDE_NAMES[game.turn]}</dd>
          </div>
          <div>
            <dt>Responses</dt>
            <dd>{context.availableMoves}</dd>
          </div>
          <div>
            <dt>Check</dt>
            <dd>{context.check ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt>Face-off</dt>
            <dd>{context.faceOff ? 'Bikjang' : 'Clear'}</dd>
          </div>
        </dl>

        <div className="selection-card">
          <h3>Selection</h3>
          {selectedPiece ? (
            <p>
              {SIDE_NAMES[selectedPiece.side]} {PIECE_NAMES[selectedPiece.type]} selected with{' '}
              {selectedMoveCount} legal move{selectedMoveCount === 1 ? '' : 's'}.
            </p>
          ) : (
            <p>Select one of the current player&apos;s pieces to reveal every legal move.</p>
          )}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="panel-card__eyebrow">Opening setup</p>
            <h2>Choose formations</h2>
          </div>
        </div>

        <div className="formation-grid">
          {(['blue', 'red'] as const).map((side) => (
            <label key={side} className="field">
              <span>{SIDE_NAMES[side]} back rank</span>
              <select
                value={setupDraft[`${side}Formation`]}
                onChange={(event) =>
                  onSetupChange(side, event.target.value as Formation)
                }
              >
                {Object.values(FORMATION_DEFINITIONS).map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.name}
                  </option>
                ))}
              </select>
              <small>
                {
                  FORMATION_DEFINITIONS[
                    setupDraft[`${side}Formation`]
                  ].description
                }
              </small>
            </label>
          ))}
        </div>

        <div className="button-grid">
          <button type="button" className="action-button" onClick={onNewGame}>
            New game
          </button>
          <button type="button" className="action-button" onClick={onReset}>
            Reset
          </button>
          <button
            type="button"
            className="action-button action-button--soft"
            onClick={onUndo}
            disabled={!canUndo}
          >
            Undo move
          </button>
          <button
            type="button"
            className="action-button action-button--soft"
            onClick={onPass}
            disabled={!context.canPass || gameEnded}
          >
            {passLabel}
          </button>
          <button
            type="button"
            className="action-button action-button--ghost"
            onClick={onHelp}
          >
            Open help / manual
          </button>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="panel-card__eyebrow">Move history</p>
            <h2>Recent turns</h2>
          </div>
        </div>

        {movePairs.length > 0 ? (
          <ol className="move-log">
            {movePairs.map((pair) => (
              <li key={pair.index} className="move-log__item">
                <span className="move-log__index">{pair.index}</span>
                <div>
                  <p>{pair.blue ?? 'Blue pending'}</p>
                  <p>{pair.red ?? 'Red pending'}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted-copy">No moves yet. Blue starts the match.</p>
        )}
      </section>
    </aside>
  );
}
