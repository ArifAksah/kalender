import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAllAchievements, getLeaderboard, getUserXP } from '../services/api';

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userXP, setUserXP] = useState({ xp: 0, level: 1, xpForNext: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ach, lb, xp] = await Promise.all([
          getAllAchievements(),
          getLeaderboard().catch(() => []),
          getUserXP().catch(() => ({ xp: 0, level: 1, xpForNext: 100 }))
        ]);
        setAchievements(ach);
        setLeaderboard(lb);
        setUserXP(xp);
      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading achievements..." />;

  const unlocked = achievements.filter(a => a.unlocked).length;
  const progress = userXP.xpForNext > 0 ? (userXP.xp / userXP.xpForNext) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Achievements</h1>
        <p className="text-blue-600 text-sm mt-1">Track your progress and compete</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Bar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {userXP.level}
                </div>
                <div>
                  <p className="text-blue-900 font-semibold">Level {userXP.level}</p>
                  <p className="text-blue-500 text-sm">{userXP.xp} / {userXP.xpForNext} XP</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </Card>

          {/* Achievements Grid */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-900">Achievements</h2>
              <span className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{unlocked}/{achievements.length} Unlocked</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-lg border ${a.unlocked ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{a.unlocked ? a.icon : '🔒'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm truncate ${a.unlocked ? 'text-blue-900' : 'text-gray-500'}`}>{a.name}</h3>
                      <p className="text-blue-500 text-xs line-clamp-2 mt-0.5">{a.description}</p>
                      <p className="text-blue-600 text-xs mt-1 font-medium">+{a.xp_reward} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="p-6 h-fit">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((user, i) => (
                <div key={user.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className={`w-6 text-center font-bold ${i < 3 ? 'text-amber-500' : 'text-blue-400'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm text-white font-medium">
                    {user.username?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-900 text-sm font-medium truncate">{user.username}</p>
                    <p className="text-blue-500 text-xs">{user.xp || 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-400 text-sm text-center py-8">No data yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Achievements;
