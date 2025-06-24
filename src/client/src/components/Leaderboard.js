import { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard({ guildId }) {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/leaderboard' + '?guildId=' + guildId)
            .then(response => {
                // Sort by message_count descending
                const sortedData = [...response.data].sort((a, b) => b.message_count - a.message_count);
                setLeaderboardData(sortedData);
            })
            .finally(() => setLoading(false));
    }, [guildId]);

    // Log each user in the leaderboardData
    useEffect(() => {
        leaderboardData.forEach(user => {
            console.log(user);
        });
    }, [leaderboardData]);
    return (
        <div className="flex flex-col items-center justify-center h-full w-full font-luckyguy">
            <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
            {loading ? (
                <p className="text-lg font-luckyguy text-[#4a4a4a]">Loading...</p>
            ) : (
                <div className="w-full max-w-5xl">
                    <div className="max-h-[400px] overflow-y-auto">
                        <table className="min-w-full bg-white rounded shadow">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 text-center">Avatar</th>
                                    <th className="py-2 px-4 text-center">Name</th>
                                    <th className="py-2 px-4 text-center">Messages</th>
                                    <th className="py-2 px-4 text-center">Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((user, idx) => (
                                    <tr key={user.id || idx} className="border-t">
                                        <td className="py-2 px-4 text-center">
                                            <img
                                                src={user.profile.avatar}
                                                alt={user.profile.userName}
                                                className="w-10 h-10 rounded-full mx-auto"
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-center font-semibold">{user.profile.userName}</td>
                                        <td className="py-2 px-4 text-center">{user.message_count}</td>
                                        <td className="py-2 px-4 text-center">{user.level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}