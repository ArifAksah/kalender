import React, { useState, useEffect } from 'react';
import './SlidingPuzzle.css';

const SIZE = 3;
const EMPTY_TILE = 0;

function SlidingPuzzle() {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

  const initializeGame = () => {
    let newTiles;
    do {
      newTiles = shuffle([...Array(SIZE * SIZE).keys()]);
    } while (!isSolvable(newTiles) || isSolved(newTiles));
    
    setTiles(newTiles);
    setMoves(0);
    setTimer(0);
    setIsWon(false);
    setIsPlaying(false);
  };

  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const isSolvable = (tiles) => {
    let inversions = 0;
    const flatTiles = tiles.filter(t => t !== EMPTY_TILE);
    
    for (let i = 0; i < flatTiles.length; i++) {
      for (let j = i + 1; j < flatTiles.length; j++) {
        if (flatTiles[i] > flatTiles[j]) {
          inversions++;
        }
      }
    }
    
    return inversions % 2 === 0;
  };

  const isSolved = (currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i) return false;
    }
    return currentTiles[currentTiles.length - 1] === EMPTY_TILE;
  };

  const canMove = (index) => {
    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;
    const tileRow = Math.floor(index / SIZE);
    const tileCol = index % SIZE;

    return (
      (Math.abs(emptyRow - tileRow) === 1 && emptyCol === tileCol) ||
      (Math.abs(emptyCol - tileCol) === 1 && emptyRow === tileRow)
    );
  };

  const moveTile = (index) => {
    if (!canMove(index) || isWon) return;

    if (!isPlaying) setIsPlaying(true);

    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    
    setTiles(newTiles);
    setMoves(moves + 1);

    if (isSolved(newTiles)) {
      setIsWon(true);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e) => {
    if (isWon) return;
    
    const emptyIndex = tiles.indexOf(EMPTY_TILE);
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;
    let targetIndex = -1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (emptyRow < SIZE - 1) targetIndex = emptyIndex + SIZE;
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (emptyRow > 0) targetIndex = emptyIndex - SIZE;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (emptyCol < SIZE - 1) targetIndex = emptyIndex + 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (emptyCol > 0) targetIndex = emptyIndex - 1;
        break;
      default:
        break;
    }

    if (targetIndex !== -1) {
      moveTile(targetIndex);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tiles, isWon]);

  return (
    <div className="sliding-puzzle">
      <div className="sliding-stats">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Moves:</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
        </div>
        <button className="reset-button" onClick={initializeGame}>
          🔄 New Game
        </button>
      </div>

      {isWon && (
        <div className="win-message">
          🎉 Congratulations! Solved in {moves} moves and {formatTime(timer)}!
        </div>
      )}

      {!isPlaying && !isWon && (
        <div className="game-hint">
          Click a tile or use arrow keys to move
        </div>
      )}

      <div className="sliding-board">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`sliding-tile ${tile === EMPTY_TILE ? 'empty' : ''} ${
              canMove(index) && tile !== EMPTY_TILE ? 'moveable' : ''
            }`}
            onClick={() => moveTile(index)}
          >
            {tile !== EMPTY_TILE && tile}
          </div>
        ))}
      </div>

      <div className="game-controls">
        Arrange numbers 1-8 in order • Use arrow keys or click tiles
      </div>
    </div>
  );
}

export default SlidingPuzzle;
