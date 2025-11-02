export enum GameState {
  Ready,
  Playing,
  GameOver,
  ModeSelection,
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export enum SeedType {
  Good,
  Hard,
  Coin,
}

export interface Seed {
  id: number;
  position: Position;
  type: SeedType;
}
