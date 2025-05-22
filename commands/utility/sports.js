const { BalldontlieAPI } = require('@balldontlie/sdk');
require('dotenv').config();

const api = new BalldontlieAPI({ apiKey: process.env.BALLDONTLIE_API_KEY });

async function getNBAScore(teamName) {
    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await api.nba.getGames({
            start_date: today,
            end_date: today,
            per_page: 100,
        });

        const game = response.data.find(game =>
            game.home_team.full_name.toLowerCase().includes(teamName.toLowerCase()) ||
            game.visitor_team.full_name.toLowerCase().includes(teamName.toLowerCase())
        );

        if (!game) {
            return `No NBA game found today for **${teamName}**.`;  // Fixed: Wrapped in backticks
        }

        let statusMessage = '';
        if (game.status === 'Final') {
            statusMessage = 'Game has finished.';
        } else if (game.status === 'In Progress') {
            statusMessage = 'Game is in progress.';
        } else {
            statusMessage = 'Game is scheduled.';
        }

        
        return `**${game.home_team.full_name}** ${game.home_team_score} - **${game.visitor_team.full_name}** ${game.visitor_team_score} (${statusMessage})`;

    } catch (error) {
        console.error(error);
        return 'Failed to fetch NBA score.';
    }
}

module.exports = { getNBAScore };
