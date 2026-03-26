import { useEffect } from 'react';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const pieceGuides = [
  {
    name: 'General',
    body: 'Moves one point at a time inside the palace. It can move orthogonally and on the palace diagonals. You lose if your general is checkmated.'
  },
  {
    name: 'Guard',
    body: 'Moves like the general but stays inside the palace. Guards are defensive palace pieces.'
  },
  {
    name: 'Horse',
    body: 'Moves one point orthogonally and then one point diagonally outward. A blocker on the first step stops the move.'
  },
  {
    name: 'Elephant',
    body: 'Moves one point orthogonally and then two points diagonally outward. Any blocker on the route stops the move.'
  },
  {
    name: 'Chariot',
    body: 'Moves any distance orthogonally. Inside a palace it may also move along the marked diagonal lines.'
  },
  {
    name: 'Cannon',
    body: 'Moves by jumping exactly one piece in a straight line. Cannons cannot jump a cannon and cannot capture a cannon.'
  },
  {
    name: 'Soldier',
    body: 'Moves one point forward or sideways. In a palace it can also move one point diagonally forward on a palace line.'
  }
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-panel__header">
          <div>
            <p className="panel-card__eyebrow">In-app manual</p>
            <h2 id="help-title">How to play this Janggi site</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="manual-grid">
          <section className="manual-card">
            <h3>What Janggi is</h3>
            <p>
              Janggi is Korean strategy chess played on the intersections of a 9
              by 10 board. Two players move in turn, attack, defend, and try to
              finish the game with checkmate.
            </p>
            <p className="credit-copy">Built by codex xhigh only</p>
          </section>

          <section className="manual-card">
            <h3>How this website works</h3>
            <p>
              Click one of the current player&apos;s pieces to select it. Legal
              destinations appear immediately. Click a highlighted destination to
              move. Click a different friendly piece to switch the selection.
            </p>
            <p>
              The side panel shows the current turn, recent moves, opening
              formation controls, and action buttons for new game, undo, reset,
              passing, and the manual.
            </p>
          </section>

          <section className="manual-card">
            <h3>Highlight meanings</h3>
            <p>Gold frame: the selected piece.</p>
            <p>Dark marker: a legal move to an empty point.</p>
            <p>Coral ring: a legal capture.</p>
            <p>
              Status text also warns you about check and bikjang face-off states.
            </p>
          </section>

          <section className="manual-card">
            <h3>Controls</h3>
            <p>New game starts a fresh match using the selected formations.</p>
            <p>Reset restarts the current game setup from move one.</p>
            <p>Undo move steps back one turn at a time.</p>
            <p>
              Pass turn is only available when the side to move is not in check.
              If bikjang is active, that button becomes a draw claim.
            </p>
          </section>

          <section className="manual-card manual-card--wide">
            <h3>Piece movement</h3>
            <div className="piece-guide-grid">
              {pieceGuides.map((piece) => (
                <article key={piece.name} className="piece-guide">
                  <h4>{piece.name}</h4>
                  <p>{piece.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="manual-card manual-card--wide">
            <h3>Known limitations</h3>
            <p>
              The site supports full local play, legal move highlighting,
              selectable opening formations, undo, passing, and bikjang draw
              claims.
            </p>
            <p>
              It does not include online multiplayer, repetition adjudication,
              or tournament point scoring.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
