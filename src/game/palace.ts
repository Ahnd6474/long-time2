import type { Position, Side } from './types';

const TOP_PALACE = {
  minX: 3,
  maxX: 5,
  minY: 0,
  maxY: 2,
  center: { x: 4, y: 1 }
};

const BOTTOM_PALACE = {
  minX: 3,
  maxX: 5,
  minY: 7,
  maxY: 9,
  center: { x: 4, y: 8 }
};

export const PALACE_DIAGONAL_LINES: Position[][] = [
  [
    { x: 3, y: 0 },
    { x: 4, y: 1 },
    { x: 5, y: 2 }
  ],
  [
    { x: 5, y: 0 },
    { x: 4, y: 1 },
    { x: 3, y: 2 }
  ],
  [
    { x: 3, y: 7 },
    { x: 4, y: 8 },
    { x: 5, y: 9 }
  ],
  [
    { x: 5, y: 7 },
    { x: 4, y: 8 },
    { x: 3, y: 9 }
  ]
];

export function isInPalace(position: Position, side?: Side): boolean {
  if (
    position.x >= TOP_PALACE.minX &&
    position.x <= TOP_PALACE.maxX &&
    position.y >= TOP_PALACE.minY &&
    position.y <= TOP_PALACE.maxY
  ) {
    return side ? side === 'red' : true;
  }

  if (
    position.x >= BOTTOM_PALACE.minX &&
    position.x <= BOTTOM_PALACE.maxX &&
    position.y >= BOTTOM_PALACE.minY &&
    position.y <= BOTTOM_PALACE.maxY
  ) {
    return side ? side === 'blue' : true;
  }

  return false;
}

export function palaceForPosition(position: Position): 'top' | 'bottom' | null {
  if (isInPalace(position, 'red')) {
    return 'top';
  }

  if (isInPalace(position, 'blue')) {
    return 'bottom';
  }

  return null;
}

export function getPalaceCenter(position: Position): Position | null {
  const palace = palaceForPosition(position);
  if (palace === 'top') {
    return TOP_PALACE.center;
  }

  if (palace === 'bottom') {
    return BOTTOM_PALACE.center;
  }

  return null;
}

export function getPalaceNeighbors(position: Position): Position[] {
  const palace = palaceForPosition(position);
  if (!palace) {
    return [];
  }

  const ranges = palace === 'top' ? TOP_PALACE : BOTTOM_PALACE;
  const neighbors: Position[] = [];

  const orthogonalOffsets = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  orthogonalOffsets.forEach((offset) => {
    const next = { x: position.x + offset.x, y: position.y + offset.y };
    if (
      next.x >= ranges.minX &&
      next.x <= ranges.maxX &&
      next.y >= ranges.minY &&
      next.y <= ranges.maxY
    ) {
      neighbors.push(next);
    }
  });

  const center = ranges.center;
  const isCenter = position.x === center.x && position.y === center.y;
  const isCorner =
    (position.x === ranges.minX || position.x === ranges.maxX) &&
    (position.y === ranges.minY || position.y === ranges.maxY);

  if (isCenter) {
    neighbors.push(
      { x: ranges.minX, y: ranges.minY },
      { x: ranges.maxX, y: ranges.minY },
      { x: ranges.minX, y: ranges.maxY },
      { x: ranges.maxX, y: ranges.maxY }
    );
  } else if (isCorner) {
    neighbors.push(center);
  }

  return neighbors;
}

export function getDiagonalLinesForPosition(position: Position): Position[][] {
  return PALACE_DIAGONAL_LINES.filter((line) =>
    line.some((candidate) => candidate.x === position.x && candidate.y === position.y)
  );
}
