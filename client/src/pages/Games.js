import React, { useState } from 'react';
import MemoryGame from '../components/Games/MemoryGame';
import SnakeGame from '../components/Games/SnakeGame';
import TicTacToe from '../components/Games/TicTacToe';
import NumberPuzzle from '../components/Games/NumberPuzzle';
import Numpuz from '../components/Games/Numpuz';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icons';

const games = [
  { id: 'memory', name: 'Memory Cards', icon: 'cards', desc: 'Match pairs of cards', color: 'from-pink-400 to-rose-500', component: MemoryGame },
  { id: 'snake', name: 'Snake', icon: 'snake', desc: 'Classic snake game', color: 'from-emerald-400 to-green-500', component: SnakeGame },
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: 'grid', desc: 'Play against AI', color: 'from-blue-400 to-indigo-500', component: TicTacToe },
  { id: 'numpuz', name: 'Numpuz', icon: 'puzzle', desc: 'Sliding puzzle', color: 'from-purple-400 to-violet-500', component: Numpuz },
  { id: '2048', name: '2048', icon: 'hash', desc: 'Merge to 2048', color: 'from-amber-400 to-orange-500', component: NumberPuzzle },
];

function Games() {
  const [selected, setSelected] = useState(null);
  const game = games.find(g => g.id === selected);

  return (
    <div className="space-y-6">
      {!selected ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Games</h1>
            <p className="text-blue-600 text-sm mt-1">Take a break and play</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => (
              <Card key={g.id} className="p-6" onClick={() => setSelected(g.id)}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white shadow-md mb-4`}>
                  <Icon name={g.icon} className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">{g.name}</h3>
                <p className="text-blue-500 text-sm mb-4">{g.desc}</p>
                <Button variant="primary" size="sm" className="w-full">
                  <Icon name="play" className="w-4 h-4" />
                  Play
                </Button>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
              <Icon name="arrowLeft" className="w-4 h-4" />
              Back
            </Button>
            <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center text-white`}>
                <Icon name={game.icon} className="w-4 h-4" />
              </div>
              {game.name}
            </h2>
          </div>
          <Card className="p-6 flex items-center justify-center min-h-[500px]">
            {game && <game.component />}
          </Card>
        </div>
      )}
    </div>
  );
}

export default Games;
