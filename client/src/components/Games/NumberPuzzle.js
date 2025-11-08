import React, { useState, useEffect, useCallback } from 'react';
import './NumberPuzzle.css';

const SIZE = 4;

function NumberPuzzle() {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initializeBoard = useCallback(() => {
    const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(initializeBoard());
  }, [initializeBoard]);

  const addNewTile = (currentBoard) => {
    const emptyCells = [];
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = useCallback((direction) => {
    if (gameOver || won) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const mergeLine = (line) => {
      let newLine = line.filter(cell => cell !== 0);
      for (let i = 0; i < newLine.length - 1; i++) {
        if (newLine[i] === newLine[i + 1]) {
          newLine[i] *= 2;
          newScore += newLine[i];
          newLine[i + 1] = 0;
          if (newLine[i] === 2048) setWon(true);
        }
      }
      newLine = newLine.filter(cell => cell !== 0);
      while (newLine.length < SIZE) {
        newLine.push(0);
      }
      return newLine;
    };

    if (direction === 'left') {
      for (let i = 0; i < SIZE; i++) {
        const newRow = mergeLine(newBoard[i]);
        if (newRow.join(',') !== newBoard[i].join(',')) moved = true;
        newBoard[i] = newRow;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < SIZE; i++) {
        const newRow = mergeLine(newBoard[i].reverse()).reverse();
        if (newRow.join(',') !== newBoard[i].join(',')) moved = true;
        newBoard[i] = newRow;
      }
    } else if (direction === 'up') {
      for (let j = 0; j < SIZE; j++) {
        const column = newBoard.map(row => row[j]);
        const newColumn = mergeLine(column);
        if (newColumn.join(',') !== column.join(',')) moved = true;
        for (let i = 0; i < SIZE; i++) {
          newBoard[i][j] = newColumn[i];
        }
      }
    } else if (direction === 'down') {
      for (let j = 0; j < SIZE; j++) {
        const column = newBoard.map(row => row[j]);
        const newColumn = mergeLine(column.reverse()).reverse();
        if (newColumn.join(',') !== column.join(',')) moved = true;
        for (let i = 0; i < SIZE; i++) {
          newBoard[i][j] = newColumn[i];
        }
      }
    }

    if (moved) {
      addNewTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      
      if (isGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, score, gameOver, won]);

  const isGameOver = (currentBoard) => {
    // Check for empty cells
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (currentBoard[i][j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (j < SIZE - 1 && currentBoard[i][j] === currentBoard[i][j + 1]) return false;
        if (i < SIZE - 1 && currentBoard[i][j] === currentBoard[i + 1][j]) return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  const resetGame = () => {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getTileColor = (value) => {
    const colors = {
      0: 'rgba(238, 228, 218, 0.35)',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  };

  return (
    <div className="number-puzzle">
      <div className="puzzle-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <button className="reset-button" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {gameOver && (
        <div className="game-message game-over">
          💀 Game Over! Final Score: {score}
        </div>
      )}

      {won && !gameOver && (
        <div className="game-message game-won">
          🎉 You Won! You reached 2048!
        </div>
      )}

      <div className="puzzle-board">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`puzzle-tile ${cell !== 0 ? 'filled' : ''}`}
              style={{
                background: getTileColor(cell),
                color: cell > 4 ? 'white' : '#776e65'
              }}
            >
              {cell !== 0 && cell}
            </div>
          ))
        )}
      </div>

      <div className="game-controls">
        Use arrow keys ⬆️ ⬇️ ⬅️ ➡️ to move tiles
      </div>
    </div>
  );
}

export default NumberPuzzle;
