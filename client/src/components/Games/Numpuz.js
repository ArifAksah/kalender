import React, { useState, useEffect } from 'react';
import './Numpuz.css';

const SIZE = 3;
const EMPTY_TILE = 8;

function Numpuz() {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('number'); // 'number' or 'image'
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop'
  ];

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    initializeGame();
  };

  const changeImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
    initializeGame();
  };

  const getTileStyle = (tile) => {
    if (mode === 'number' || tile === EMPTY_TILE) return {};
    
    const row = Math.floor(tile / SIZE);
    const col = tile % SIZE;
    
    return {
      backgroundImage: `url(${images[selectedImage]})`,
      backgroundSize: '300px 300px',
      backgroundPosition: `-${col * 100}px -${row * 100}px`
    };
  };

  return (
    <div className="numpuz-game">
      <div className="numpuz-header">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'number' ? 'active' : ''}`}
            onClick={() => changeMode('number')}
          >
            🔢 Numbers
          </button>
          <button 
            className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
            onClick={() => changeMode('image')}
          >
            🖼️ Image
          </button>
          {mode === 'image' && (
            <button className="change-img-btn" onClick={changeImage}>
              🔄 Change Image
            </button>
          )}
        </div>
      </div>

      <div className="numpuz-stats">
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
          🎉 Puzzle Solved! {moves} moves • {formatTime(timer)}
        </div>
      )}

      {!isPlaying && !isWon && (
        <div className="game-hint">
          {mode === 'number' ? 'Arrange 1-8 in order' : 'Complete the picture'}
        </div>
      )}

      <div className="numpuz-board">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`numpuz-tile ${tile === EMPTY_TILE ? 'empty' : ''} ${
              canMove(index) && tile !== EMPTY_TILE ? 'moveable' : ''
            }`}
            onClick={() => moveTile(index)}
            style={getTileStyle(tile)}
          >
            {mode === 'number' && tile !== EMPTY_TILE && (tile + 1)}
          </div>
        ))}
      </div>

      <div className="game-controls">
        Click tiles or use arrow keys ⬆️ ⬇️ ⬅️ ➡️
      </div>
    </div>
  );
}

export default Numpuz;
