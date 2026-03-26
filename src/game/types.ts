export type Side = 'blue' | 'red';

export type PieceType =
  | 'general'
  | 'guard'
  | 'horse'
  | 'elephant'
  | 'chariot'
  | 'cannon'
  | 'soldier';

export type Formation = 'inner' | 'outer' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: string;
  side: Side;
  type: PieceType;
  label: string;
  name: string;
}

export type BoardState = Array<Array<Piece | null>>;

export interface SetupOptions {
  redFormation: Formation;
  blueFormation: Formation;
}

export interface MoveCandidate {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece | null;
  isCapture: boolean;
}

export interface TurnRecord {
  id: string;
  moveNumber: number;
  side: Side;
  summary: string;
  pass: boolean;
  pieceType?: PieceType;
  from?: Position;
  to?: Position;
  capturedType?: PieceType;
}

export interface GameSnapshot {
  board: BoardState;
  turn: Side;
  winner: Side | null;
  drawReason: string | null;
  previousWasPass: boolean;
  moveHistory: TurnRecord[];
  setup: SetupOptions;
}

export interface GameState extends GameSnapshot {
  history: GameSnapshot[];
}

export interface TurnContext {
  check: boolean;
  faceOff: boolean;
  availableMoves: number;
  canPass: boolean;
  status: string;
}
