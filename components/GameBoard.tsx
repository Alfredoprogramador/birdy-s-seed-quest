import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Position, Seed, SeedType, Difficulty } from '../types';
import { BOARD_SIZE, CELL_SIZE } from '../constants';

interface GameBoardProps {
  onGameOver: () => void;
  onScore: () => void;
  onCoinCollect: () => void;
  difficulty: Difficulty;
}

const difficultySettings = {
  easy:   { initialSeeds: 30, hardSeedChance: 0.1,  coinChance: 0.15 },
  normal: { initialSeeds: 40, hardSeedChance: 0.2,  coinChance: 0.1  },
  hard:   { initialSeeds: 50, hardSeedChance: 0.35, coinChance: 0.05 },
};

// Helper function to generate a random position, avoiding existing ones
const getRandomPosition = (existingPositions: Position[] = []): Position => {
  let newPosition: Position;
  let isOccupied = false;
  do {
    newPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    isOccupied = existingPositions.some(p => p.x === newPosition.x && p.y === newPosition.y);
  } while (isOccupied);
  return newPosition;
};

const GameBoard: React.FC<GameBoardProps> = ({ onGameOver, onScore, onCoinCollect, difficulty }) => {
  const [birdPosition, setBirdPosition] = useState<Position>({ x: 10, y: 10 });
  const [seeds, setSeeds] = useState<Seed[]>([]);
  
  const { initialSeeds, hardSeedChance, coinChance } = useMemo(() => difficultySettings[difficulty], [difficulty]);
  const seedIdCounter = useRef(initialSeeds);

  const getNewSeedType = useCallback(() => {
    const rand = Math.random();
    if (rand < hardSeedChance) {
      return SeedType.Hard;
    } else if (rand < hardSeedChance + coinChance) {
      return SeedType.Coin;
    }
    return SeedType.Good;
  }, [hardSeedChance, coinChance]);

  const resetGame = useCallback(() => {
    const initialBirdPos = { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) };
    setBirdPosition(initialBirdPos);

    const newSeeds: Seed[] = [];
    const existingPositions: Position[] = [initialBirdPos];
    for (let i = 0; i < initialSeeds; i++) {
      const position = getRandomPosition(existingPositions);
      existingPositions.push(position);
      newSeeds.push({
        id: i,
        position,
        type: getNewSeedType(),
      });
    }
    setSeeds(newSeeds);
    seedIdCounter.current = initialSeeds;
  }, [initialSeeds, getNewSeedType]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
    }
    
    setBirdPosition(prevPos => {
      let newPos = { ...prevPos };
      switch (e.key) {
        case 'ArrowUp': newPos.y = Math.max(0, prevPos.y - 1); break;
        case 'ArrowDown': newPos.y = Math.min(BOARD_SIZE - 1, prevPos.y + 1); break;
        case 'ArrowLeft': newPos.x = Math.max(0, prevPos.x - 1); break;
        case 'ArrowRight': newPos.x = Math.min(BOARD_SIZE - 1, prevPos.x + 1); break;
        default: return prevPos;
      }

      const collidedSeedIndex = seeds.findIndex(seed => seed.position.x === newPos.x && seed.position.y === newPos.y);
      
      if (collidedSeedIndex === -1) {
        return newPos; // No collision, just move
      }

      const collidedSeed = seeds[collidedSeedIndex];
      
      if (collidedSeed.type === SeedType.Hard) {
        onGameOver();
        return prevPos; // Don't move, game is over
      }
      
      // It's a good seed or a coin, so we collect it
      if (collidedSeed.type === SeedType.Coin) {
        onCoinCollect();
      } else { // SeedType.Good
        onScore();
      }

      // Remove the collected seed and add a new one
      const newSeedsList = seeds.filter((_, index) => index !== collidedSeedIndex);
      const existingPositions = [newPos, ...newSeedsList.map(s => s.position)];
      const newSeedPosition = getRandomPosition(existingPositions);
      
      newSeedsList.push({
        id: seedIdCounter.current++,
        position: newSeedPosition,
        type: getNewSeedType(),
      });
      setSeeds(newSeedsList);

      return newPos; // Move to the new position
    });
  }, [seeds, onGameOver, onScore, onCoinCollect, getNewSeedType]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="relative bg-green-400/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border-4 border-green-600/50"
      style={{
        width: `${BOARD_SIZE * CELL_SIZE}px`,
        height: `${BOARD_SIZE * CELL_SIZE}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
      }}
    >
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => (
        <div key={i} className="border-r border-b border-white/10"></div>
      ))}
      
      <div className="absolute inset-0">
        <div
          className="absolute transition-all duration-100 ease-linear"
          style={{
            width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`,
            left: `${birdPosition.x * CELL_SIZE}px`, top: `${birdPosition.y * CELL_SIZE}px`,
          }}
        >
          {/* Bird Body */}
          <div className="absolute w-4/5 h-4/5 bg-yellow-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse">
            {/* Wing */}
            <div className="absolute w-3/5 h-2/5 bg-yellow-500/80 rounded-full top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 -rotate-20 shadow-inner"></div>
          </div>
          {/* Eye */}
          <div className="absolute w-1/5 h-1/5 bg-gray-800 rounded-full top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2"></div>
          {/* Beak */}
          <div
            className="absolute"
            style={{
              top: '48%',
              left: '80%',
              transform: 'translate(-50%, -50%)',
              width: 0,
              height: 0,
              borderTop: `${CELL_SIZE * 0.15}px solid transparent`,
              borderBottom: `${CELL_SIZE * 0.15}px solid transparent`,
              borderLeft: `${CELL_SIZE * 0.25}px solid #f97316`, // Tailwind orange-500
            }}
          />
        </div>

        {seeds.map(seed => {
            const style = {
              width: `${CELL_SIZE * 0.5}px`, height: `${CELL_SIZE * 0.5}px`,
              left: `${seed.position.x * CELL_SIZE + CELL_SIZE * 0.25}px`,
              top: `${seed.position.y * CELL_SIZE + CELL_SIZE * 0.25}px`,
            };

            switch (seed.type) {
              case SeedType.Hard:
                return <div key={seed.id} className="absolute rounded-md bg-gray-800" style={{...style, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)'}} />;
              case SeedType.Coin:
                return (
                  <div key={seed.id} className="absolute rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-lg animate-pulse" style={style}>
                    <div className="absolute w-1/2 h-1/2 rounded-full bg-yellow-500/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                );
              case SeedType.Good:
              default:
                return <div key={seed.id} className="absolute rounded-full bg-amber-700" style={{...style, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'}} />;
            }
          })}
      </div>
    </div>
  );
};

export default GameBoard;
