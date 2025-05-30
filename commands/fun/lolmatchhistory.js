const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolprofile')
        .setDescription('gets the league of legends player of the user')

        .addStringOption(option =>
            option.setName('summoner_name')
                .setDescription('the summoner name'),
        )

        .addStringOption(option =>
            option.setName('tag')
                .setDescription('the tag of the summoner'),
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const profile_name = interaction.options.getString('summoner_name');
        const tag = interaction.options.getString('tag').replace('#', '');

        const data = await getLolPuuid(profile_name, tag);
        const puuid = data.puuid;

        const match_ids = await getMatchIds(puuid);

        for (let i = 0; i < Math.min(match_ids.length, 10); i++) {
            const match_data = await getMatchData(match_ids[i]);

            const pix = match_data['metadata']['participants'].findIndex(p => p == puuid);
            const user_match_data = match_data['info']['participants'][pix];

        }

          const playerEmbed = new EmbedBuilder()
            .setTitle(`${profile_name} - match history`)
            .setColor(0x0099FF)
            //.setThumbnail(profileIconUrl)
            .addFields(
                //{ name: '🎯 Level', value: `${level}`, inline: true },
                { name: '📊 Win Rate', value: `${(win_rate * 100).toFixed(1)}%`, inline: true },
                { name: '⚔ KDA', value: `${((averageK + averageA) / averageD).toFixed(2)}`, inline: true },
                { name: '🎮 Games Played', value: `${total_games}`, inline: true },
            )
            .setFooter({ text: 'League of Legends Stats' })
            .setTimestamp();

        // Send the embed
        await interaction.channel.send({ embeds: [playerEmbed] });

    },
};

async function getLolPuuid(name, tag) {
    const response = await fetch(`${process.env.LOL_BASE_URL}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, {
        headers: { 'X-Riot-Token': process.env.LOL_KEY },
    });

    const data = await response.json();

    return data;
}

// returns last 20 matches
async function getMatchIds(puuid) {
    const response = await fetch(`${process.env.LOL_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids`, {
        headers: { 'X-Riot-Token': process.env.LOL_KEY },
    });

    const match_ids = await response.json();

    return match_ids;
}

async function getMatchData(match_id) {
    const response = await fetch(`${process.env.LOL_BASE_URL}/lol/match/v5/matches/${match_id}`, {
        headers: { 'X-Riot-Token': process.env.LOL_KEY },
    });

    console.log(`${process.env.LOL_BASE_URL}/lol/match/v5/matches/${match_id}`);

    const match_data = await response.json();
    return match_data;

}


