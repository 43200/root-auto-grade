import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://root-auto-grade.onrender.com/leaderboard");
      setLeaderboard(response.data?.leaderboard || []);
    } catch (error) {
      setError("⚠️ Error fetching leaderboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-4xl font-bold mb-6">🏆 Leaderboard</h2>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-blue-500">Loading leaderboard...</p>}

      <table className="border-collapse border border-gray-400 bg-white shadow-lg">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="px-6 py-3 border border-gray-300">Rank</th>
            <th className="px-6 py-3 border border-gray-300">Username</th>
            <th className="px-6 py-3 border border-gray-300">Best Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center p-4">No scores available</td>
            </tr>
          ) : (
            leaderboard.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="px-6 py-3 border border-gray-300">{index + 1}</td>
                <td className="px-6 py-3 border border-gray-300">{entry.user}</td>
                <td className="px-6 py-3 border border-gray-300">{entry.score}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
