import React, { useState, useCallback, useMemo, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import { GameState, Difficulty } from './types';

// Sound URLs for different game events
const SCORE_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_2b23301b4b.mp3';
const GAMEOVER_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3ff08ed02.mp3';
const START_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/08/17/audio_487053b32d.mp3';
const COIN_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/10/audio_5e6bb8c433.mp3';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [totalPoints, setTotalPoints] = useState(() => Number(localStorage.getItem('totalPoints')) || 0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const scoreSound = useMemo(() => new Audio(SCORE_SOUND_URL), []);
  const gameOverSound = useMemo(() => new Audio(GAMEOVER_SOUND_URL), []);
  const startSound = useMemo(() => new Audio(START_SOUND_URL), []);
  const coinSound = useMemo(() => new Audio(COIN_SOUND_URL), []);

  useEffect(() => {
    localStorage.setItem('totalPoints', String(totalPoints));
  }, [totalPoints]);

  const playSound = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch(error => console.error("Audio playback failed:", error));
  };

  const handleStartGame = () => {
    playSound(startSound);
    setScore(0);
    setCoins(0);
    setGameState(GameState.Playing);
  };

  const handleGameOver = useCallback(() => {
    playSound(gameOverSound);
    setGameState(GameState.GameOver);
    setTotalPoints(prevTotal => prevTotal + score);
  }, [gameOverSound, score]);

  const handleScore = useCallback(() => {
    playSound(scoreSound);
    setScore((prevScore) => prevScore + 1);
  }, [scoreSound]);
  
  const handleCoinCollect = useCallback(() => {
    playSound(coinSound);
    setCoins((prevCoins) => prevCoins + 1);
    setScore((prevScore) => prevScore + 1); // Coins also give a point
  }, [coinSound]);

  const handleSelectDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setGameState(GameState.Ready);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.Playing:
        return (
          <>
            <div className="absolute top-4 left-4 text-white text-2xl font-bold bg-black/40 px-4 py-2 rounded-lg z-10 space-y-1">
              <div>Score: {score}</div>
              <div className="flex items-center gap-2">
                <span role="img" aria-label="coin" className="text-yellow-300 text-3xl">💰</span>
                <span>{coins}</span>
              </div>
            </div>
            <p className="absolute bottom-4 text-white/50 text-sm hidden md:block">Use arrow keys to move</p>
            <GameBoard onGameOver={handleGameOver} onScore={handleScore} onCoinCollect={handleCoinCollect} difficulty={difficulty} />
          </>
        );
      case GameState.GameOver:
        return (
          <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl text-center mx-4">
            <h2 className="text-4xl font-bold text-red-600 mb-4">Game Over</h2>
            <div className="text-xl text-gray-700 mb-6 space-y-2">
                <p>Your final score: <span className="font-bold text-2xl text-gray-900">{score}</span></p>
                <p>Coins collected: <span className="font-bold text-2xl text-yellow-600">{coins} 💰</span></p>
                <p>Total points: <span className="font-bold text-2xl text-blue-600">{totalPoints}</span></p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        );
      case GameState.ModeSelection:
        return (
          <div className="flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-2xl mx-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">Select Difficulty</h2>
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
              <button
                onClick={() => handleSelectDifficulty('easy')}
                className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 text-lg"
              >
                Easy
              </button>
              <button
                onClick={() => handleSelectDifficulty('normal')}
                className="px-8 py-4 bg-yellow-500 text-white font-bold rounded-lg shadow-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 text-lg"
              >
                Normal
              </button>
              <button
                onClick={() => handleSelectDifficulty('hard')}
                className="px-8 py-4 bg-red-500 text-white font-bold rounded-lg shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105 text-lg"
              >
                Hard
              </button>
            </div>
            <button
              onClick={() => setGameState(GameState.Ready)}
              className="mt-8 text-gray-600 hover:text-gray-800 font-semibold"
            >
              &larr; Back
            </button>
          </div>
        );
      case GameState.Ready:
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-2xl mx-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">
              <span role="img" aria-label="bird">🐦</span> Birdy's Seed Quest
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-md my-4">
              Use the <span className="font-semibold text-gray-800">arrow keys</span> to move the bird. Eat seeds and collect coins to score points. But be careful, some seeds are hard and will end your quest!
            </p>
             <div className="mb-4 text-lg text-gray-700">
              Current Mode: <span className="font-bold capitalize text-gray-900">{difficulty}</span>
            </div>
             <div className="mb-6 text-2xl font-bold text-yellow-600 bg-black/10 px-4 py-2 rounded-lg">
              Total Points: {totalPoints}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button
                onClick={handleStartGame}
                className="px-10 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 text-xl"
              >
                Start Game
              </button>
              <button
                onClick={() => setGameState(GameState.ModeSelection)}
                className="px-10 py-4 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-transform transform hover:scale-105 text-xl"
              >
                Game Modes
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 to-emerald-500 font-sans p-4 overflow-hidden">
      {renderContent()}
    </main>
  );
};

export default App;
