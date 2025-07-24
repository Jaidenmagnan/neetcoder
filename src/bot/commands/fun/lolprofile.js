const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolprofile')
        .setDescription('gets the league of legends player of the user')

        .addStringOption((option) =>
            option
                .setName('summoner_name')
                .setDescription('the summoner name')
                .setRequired(true)
        )

        .addStringOption((option) =>
            option
                .setName('tag')
                .setDescription('the tag of the summoner')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });
        const profile_name = interaction.options.getString('summoner_name');
        const tag = interaction.options.getString('tag').replace('#', '');

        const data = await getLolPuuid(profile_name, tag);

        if (!data) {
            await interaction.editReply({ content: 'summoner not found' });
            return;
        }

        await interaction.editReply({ content: 'summoner found!' });

        const puuid = data.puuid;

        const match_ids = await getMatchIds(puuid);

        let total_kills = 0;
        let total_deaths = 0;
        let total_assists = 0;
        let total_games = 0;
        let total_wins = 0;

        for (let i = 0; i < Math.min(match_ids.length, 20); i++) {
            const match_data = await getMatchData(match_ids[i]);

            const pix = match_data['metadata']['participants'].findIndex(
                (p) => p == puuid
            );
            const user_match_data = match_data['info']['participants'][pix];

            total_kills += user_match_data['kills'];
            total_deaths += user_match_data['deaths'];
            total_assists += user_match_data['assists'];
            total_wins += user_match_data['win'] == 1 ? 1 : 0;

            total_games += 1;
        }

        const win_rate = total_wins / total_games;
        const averageK = total_kills / total_games;
        const averageD = total_deaths / total_games;
        const averageA = total_assists / total_games;

        const playerEmbed = new EmbedBuilder()
            .setTitle(`${profile_name} - league stats`)
            .setColor(0x0099ff)
            //.setThumbnail(profileIconUrl)
            .addFields(
                {
                    name: '📊 Win Rate',
                    value: `${(win_rate * 100).toFixed(1)}%`,
                    inline: true,
                },
                {
                    name: '⚔ KDA',
                    value: `${((averageK + averageA) / averageD).toFixed(2)}`,
                    inline: true,
                },
                {
                    name: '🎮 Games Played',
                    value: `${total_games}`,
                    inline: true,
                }
            )
            .setFooter({ text: 'League of Legends Stats' })
            .setTimestamp();

        await interaction.channel.send({ embeds: [playerEmbed] });
    },
};

async function getLolPuuid(name, tag) {
    const response = await fetch(
        `${process.env.LOL_BASE_URL}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
        {
            headers: { 'X-Riot-Token': process.env.LOL_KEY },
        }
    );

    const data = await response.json();

    if (data.status) {
        return null;
    }

    return data;
}

// returns last 20 matches
async function getMatchIds(puuid) {
    const response = await fetch(
        `${process.env.LOL_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
            headers: { 'X-Riot-Token': process.env.LOL_KEY },
        }
    );

    const match_ids = await response.json();

    return match_ids;
}

async function getMatchData(match_id) {
    const response = await fetch(
        `${process.env.LOL_BASE_URL}/lol/match/v5/matches/${match_id}`,
        {
            headers: { 'X-Riot-Token': process.env.LOL_KEY },
        }
    );

    const match_data = await response.json();
    return match_data;
}
