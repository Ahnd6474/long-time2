import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { HelpModal } from './components/HelpModal';
import { SidePanel } from './components/SidePanel';
import { DEFAULT_SETUP, FORMATION_DEFINITIONS, SIDE_NAMES } from './game/constants';
import { getPiece, positionsEqual } from './game/board';
import {
  createGame,
  getLegalMoves,
  getTurnContext,
  movePiece,
  passTurn,
  resetGame,
  undoGame
} from './game/engine';
import type { Formation, Position, SetupOptions, Side } from './game/types';

export default function App() {
  const [game, setGame] = useState(() => createGame(DEFAULT_SETUP));
  const [setupDraft, setSetupDraft] = useState<SetupOptions>(DEFAULT_SETUP);
  const [selected, setSelected] = useState<Position | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const context = getTurnContext(game);
  const selectedPiece = selected ? getPiece(game.board, selected) : null;
  const legalMoves = selected ? getLegalMoves(game, selected) : [];
  const gameEnded = Boolean(game.winner || game.drawReason);

  const commitGame = (nextGame: typeof game) => {
    setGame(nextGame);
    setSelected(null);
  };

  const handleSetupChange = (side: Side, formation: Formation) => {
    setSetupDraft((current) => ({
      ...current,
      [`${side}Formation`]: formation
    }));
  };

  const handlePointClick = (position: Position) => {
    if (gameEnded) {
      return;
    }

    const clickedPiece = getPiece(game.board, position);
    const selectedMove = legalMoves.find((move) => positionsEqual(move.to, position));

    if (selected && selectedMove) {
      commitGame(movePiece(game, selected, position));
      return;
    }

    if (selected && positionsEqual(selected, position)) {
      setSelected(null);
      return;
    }

    if (clickedPiece?.side === game.turn) {
      setSelected(position);
    }
  };

  const winnerLabel = game.winner ? `${SIDE_NAMES[game.winner]} wins` : null;
  const openingSummary = `${FORMATION_DEFINITIONS[game.setup.blueFormation].name} / ${
    FORMATION_DEFINITIONS[game.setup.redFormation].name
  }`;

  return (
    <>
      <div className="app-shell">
        <header className="site-header">
          <div className="site-header__copy">
            <p className="site-header__eyebrow">Playable Korean strategy chess</p>
            <h1>Han &amp; Cho Janggi</h1>
            <p>
              A clean local-play Janggi website with legal move highlighting,
              undo, reset, opening formation selection, and a built-in manual.
            </p>
          </div>

          <div className="site-header__meta">
            <span className="credit-pill">Built by codex xhigh only</span>
            <button
              type="button"
              className="action-button action-button--soft"
              onClick={() => setHelpOpen(true)}
            >
              Help / manual
            </button>
          </div>
        </header>

        <main className="main-layout">
          <section className="board-panel">
            <div className="board-panel__header">
              <div>
                <p className="panel-card__eyebrow">Live match</p>
                <h2>{winnerLabel ?? context.status}</h2>
                <p className="muted-copy">
                  Current formations: {openingSummary}. Blue moves first.
                </p>
              </div>
              <div className="board-panel__badges">
                <span className={`turn-badge turn-badge--${game.turn}`}>
                  {SIDE_NAMES[game.turn]} turn
                </span>
                {context.check ? <span className="state-pill">Check</span> : null}
                {context.faceOff ? <span className="state-pill">Bikjang</span> : null}
              </div>
            </div>

            <GameBoard
              board={game.board}
              turn={game.turn}
              selected={selected}
              legalMoves={legalMoves}
              onPointClick={handlePointClick}
              disabled={gameEnded}
            />
          </section>

          <SidePanel
            game={game}
            context={context}
            setupDraft={setupDraft}
            selectedPiece={selectedPiece?.side === game.turn ? selectedPiece : null}
            selectedMoveCount={legalMoves.length}
            onSetupChange={handleSetupChange}
            onNewGame={() => commitGame(createGame(setupDraft))}
            onReset={() => commitGame(resetGame(game))}
            onUndo={() => commitGame(undoGame(game))}
            onPass={() => commitGame(passTurn(game))}
            onHelp={() => setHelpOpen(true)}
          />
        </main>

        <footer className="site-footer">
          <p>Built by codex xhigh only</p>
        </footer>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
