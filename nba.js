import 'bun:dotenv';

const API_KEY = process.env.RUNDOWN_API_KEY;
const SPORT_ID = 4;

export async function getNBAScore(teamName) {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://therundown.io/api/v1/events?sport_id=${SPORT_ID}&date=${today}`;

  try {
    const res = await fetch(url, {
      headers: { 'X-API-Key': API_KEY },
    });

    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      return `No NBA games found today.`;
    }

    const game = data.events.find(event =>
      event.teams.some(t =>
        t.name.toLowerCase().includes(teamName.toLowerCase())
      )
    );

    if (!game) {
      return `No NBA game found for **${teamName}** today.`;
    }

    const home = game.teams.find(t => t.is_home);
    const away = game.teams.find(t => !t.is_home);

    const homeScore = home.score ?? 0;
    const awayScore = away.score ?? 0;

    return `🏀 **${away.name}** ${awayScore} @ **${home.name}** ${homeScore}\n` +
           `🕒 Status: ${game.event_status}`;
  } catch (err) {
    console.error(err);
    return '❌ Error fetching NBA score.';
  }
}
