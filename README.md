# Han & Cho Janggi

A polished Korean Janggi web app built with React, TypeScript, and Vite.

The project delivers a fully playable local two-player Janggi experience in the browser with legal move highlighting, palace-aware movement, undo, reset, pass / bikjang draw flow, selectable opening formations, and an in-app manual. The frontend includes visible credit text: `Built by codex xhigh only`.

## Project overview

This site is designed as a clean web product rather than a rough board demo.

Key goals:

- Play Janggi immediately in the browser.
- Highlight every legal move for the selected piece.
- Keep the rules engine separate from the React UI.
- Provide a manual inside the app so new players can learn quickly.
- Keep the codebase simple, readable, and easy to run locally.

## Stack

- React 19
- TypeScript
- Vite
- Vitest
- Plain CSS with a responsive layout

## Feature summary

- Full local two-player Janggi board
- Turn-based movement and captures
- Legal move highlighting for the selected piece
- Distinct visuals for selected pieces, legal moves, and capture moves
- Palace-aware movement for general, guard, soldier, chariot, and cannon
- Horse and elephant blocking rules
- Cannon hurdle rules and cannon capture restrictions
- Check detection and self-check rejection
- Checkmate end state
- Pass turn support when not in check
- Bikjang face-off draw claim through pass
- Undo move
- Reset current setup
- New game with selectable opening formations
- In-app help / manual modal
- Branded frontend credit on the main view and manual

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Run tests

```bash
npm test
```

## How to use

- Blue moves first.
- Click one of the current player’s pieces to select it.
- Legal destinations appear immediately.
- Click a highlighted destination to move.
- Click another friendly piece to switch selection.
- Use the right-side controls for new game, undo, reset, passing, and help.

## Folder structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ GameBoard.tsx
│  │  ├─ HelpModal.tsx
│  │  ├─ PieceToken.tsx
│  │  └─ SidePanel.tsx
│  ├─ game/
│  │  ├─ board.ts
│  │  ├─ constants.ts
│  │  ├─ engine.test.ts
│  │  ├─ engine.ts
│  │  ├─ notation.ts
│  │  ├─ palace.ts
│  │  └─ types.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ index.html
├─ package.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

## Rules covered

The rules engine currently includes:

- Legal move generation for every Janggi piece
- Palace line movement and palace diagonals where relevant
- Blocking logic for horses and elephants
- Cannon jump logic, including no jumping over or capturing cannons
- Capture validation
- Check detection
- Prevention of illegal moves that leave your general in check
- Checkmate detection
- Bikjang face-off detection and draw claim via pass

## Current limitations

- Local play only, with no network multiplayer
- No repetition adjudication
- No tournament point scoring / counting rules

## Verification

Verified locally with:

- `npm test`
- `npm run build`
