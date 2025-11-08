import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (currentBoard) => {
    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        setWinningLine(combo);
        return currentBoard[a];
      }
    }
    return currentBoard.every(cell => cell !== null) ? 'draw' : null;
  };

  const aiMove = (currentBoard) => {
    // Simple AI: try to win, block player, or pick random
    const availableMoves = currentBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter(index => index !== null);

    // Check if AI can win
    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') {
        return move;
      }
    }

    // Check if need to block player
    for (let move of availableMoves) {
      const testBoard = [...currentBoard];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') {
        return move;
      }
    }

    // Pick random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handleCellClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      return;
    }

    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const aiMoveIndex = aiMove(board);
        if (aiMoveIndex !== undefined) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = 'O';
          setBoard(newBoard);
          
          const gameResult = checkWinner(newBoard);
          if (gameResult) {
            setWinner(gameResult);
          }
        }
        setIsPlayerTurn(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine([]);
  };

  return (
    <div className="tictactoe-game">
      <div className="tictactoe-stats">
        <div className="player-indicator">
          {!winner && (
            <span>
              {isPlayerTurn ? '🔵 Your Turn (X)' : '🔴 AI Turn (O)'}
            </span>
          )}
        </div>
        <button className="reset-button" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {winner && (
        <div className="winner-message">
          {winner === 'draw'
            ? '🤝 It\'s a Draw!'
            : winner === 'X'
            ? '🎉 You Won!'
            : '🤖 AI Won!'}
        </div>
      )}

      <div className="tictactoe-board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`tictactoe-cell ${cell ? 'filled' : ''} ${
              winningLine.includes(index) ? 'winning-cell' : ''
            }`}
            onClick={() => handleCellClick(index)}
          >
            {cell === 'X' && <span className="player-x">✕</span>}
            {cell === 'O' && <span className="player-o">◯</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicTacToe;
