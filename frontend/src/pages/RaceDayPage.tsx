import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const RaceDayPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isPitWallMode, setIsPitWallMode] = useState(false);
  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('leaderboardUpdate', (data) => {
      setLeaderboard(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className={`p-4 ${isPitWallMode ? 'h-screen w-screen bg-black text-white' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Race Day Dashboard</h1>
        <button
          onClick={() => setIsPitWallMode(!isPitWallMode)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isPitWallMode ? 'Exit Pit Wall' : 'Enter Pit Wall'}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-2">Live Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <p>Waiting for data...</p>
        ) : (
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index} className="border-b border-gray-600 py-2">
                P{index + 1}: {entry.driverName} - {entry.lapTime}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RaceDayPage;
