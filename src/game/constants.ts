import type { Formation, PieceType, SetupOptions, Side } from './types';

export const BOARD_COLUMNS = 9;
export const BOARD_ROWS = 10;

export const DEFAULT_SETUP: SetupOptions = {
  redFormation: 'outer',
  blueFormation: 'outer'
};

export const SIDE_NAMES: Record<Side, string> = {
  blue: 'Blue',
  red: 'Red'
};

export const PIECE_NAMES: Record<PieceType, string> = {
  general: 'General',
  guard: 'Guard',
  horse: 'Horse',
  elephant: 'Elephant',
  chariot: 'Chariot',
  cannon: 'Cannon',
  soldier: 'Soldier'
};

export const PIECE_LABELS: Record<Side, Record<PieceType, string>> = {
  blue: {
    general: '楚',
    guard: '士',
    horse: '馬',
    elephant: '象',
    chariot: '車',
    cannon: '包',
    soldier: '卒'
  },
  red: {
    general: '漢',
    guard: '士',
    horse: '馬',
    elephant: '象',
    chariot: '車',
    cannon: '包',
    soldier: '兵'
  }
};

export const FORMATION_DEFINITIONS: Record<
  Formation,
  {
    id: Formation;
    name: string;
    description: string;
    sequence: [PieceType, PieceType, PieceType, PieceType];
  }
> = {
  inner: {
    id: 'inner',
    name: 'Inner elephant',
    description: 'Horse, elephant, elephant, horse.',
    sequence: ['horse', 'elephant', 'elephant', 'horse']
  },
  outer: {
    id: 'outer',
    name: 'Outer elephant',
    description: 'Elephant, horse, horse, elephant.',
    sequence: ['elephant', 'horse', 'horse', 'elephant']
  },
  left: {
    id: 'left',
    name: 'Left elephant',
    description: 'Elephant, horse, elephant, horse.',
    sequence: ['elephant', 'horse', 'elephant', 'horse']
  },
  right: {
    id: 'right',
    name: 'Right elephant',
    description: 'Horse, elephant, horse, elephant.',
    sequence: ['horse', 'elephant', 'horse', 'elephant']
  }
};
