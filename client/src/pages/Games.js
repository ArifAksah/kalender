import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import MemoryGame from '../components/Games/MemoryGame';
import SnakeGame from '../components/Games/SnakeGame';
import TicTacToe from '../components/Games/TicTacToe';
import NumberPuzzle from '../components/Games/NumberPuzzle';
import Numpuz from '../components/Games/Numpuz';
import '../styles/pageWrapper.css';
import './Games.css';

function Games() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'memory',
      name: 'Memory Cards',
      icon: '🎴',
      description: 'Match pairs of cards to win!',
      component: MemoryGame,
      color: 'var(--primary-light)'
    },
    {
      id: 'snake',
      name: 'Snake Game',
      icon: '🐍',
      description: 'Classic snake game - eat and grow!',
      component: SnakeGame,
      color: 'var(--primary)'
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      icon: '⭕',
      description: 'Play against AI - get 3 in a row!',
      component: TicTacToe,
      color: 'var(--primary-dark)'
    },
    {
      id: 'numpuz',
      name: 'Numpuz',
      icon: '🧩',
      description: 'Slide puzzle with numbers or images!',
      component: Numpuz,
      color: 'var(--primary)'
    },
    {
      id: '2048',
      name: '2048 Puzzle',
      icon: '🔢',
      description: 'Merge numbers to reach 2048!',
      component: NumberPuzzle,
      color: 'var(--primary-light)'
    }
  ];

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  const selectedGameData = games.find(g => g.id === selectedGame);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="games-page">
          <header className="games-header">
            <div className="games-title-section">
              <h1>🎮 Mini Games</h1>
              <p className="games-subtitle">Take a break and play some fun games!</p>
            </div>
          </header>

          {!selectedGame ? (
            <div className="games-grid">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="game-card"
                  onClick={() => handleGameSelect(game.id)}
                  style={{ borderColor: game.color }}
                >
                  <div className="game-icon">{game.icon}</div>
                  <h3 className="game-name">{game.name}</h3>
                  <p className="game-description">{game.description}</p>
                  <button className="play-button">Play Now</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="game-container">
              <div className="game-header-bar">
                <button className="back-button" onClick={handleBackToMenu}>
                  ← Back to Games
                </button>
                <h2>{selectedGameData.icon} {selectedGameData.name}</h2>
              </div>
              <div className="game-play-area">
                {selectedGameData && <selectedGameData.component />}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Games;
