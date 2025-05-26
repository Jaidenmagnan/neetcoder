const { SlashCommandBuilder } = require('discord.js');
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
        interaction.deferReply();
        const profile_name = interaction.options.getString('summoner_name');
        const tag = interaction.options.getString('tag').replace('#', '');

        const data = await getLolPuuid(profile_name, tag);
        console.log(data);

        const puuid = data.puuid;
        const encrypt_summon = data.id;

        const match_ids = await getMatchIds(puuid);

        let total_kills = 0;
        let total_deaths = 0;
        let total_assists = 0;
        let total_games = 0;
        let total_wins = 0;

        for (let i = 0; i < 1; i++) {
            const match_data = await getMatchData(match_ids[i]);

            const pix = match_data['metadata']['participants'].findIndex(p => p == puuid);
            const user_match_data = match_data['info']['participants'][pix];

            total_kills += user_match_data['kills'];
            total_deaths += user_match_data['deaths'];
            total_assists += user_match_data['assists'];
            total_wins += user_match_data['win'] == 1 ? 1 : 0;

            total_games += 1;
        }

        const summoner = await getSummonerData(encrypt_summon);


        const win_rate = total_wins / total_games;
        const username = summoner.name;
        const level = summoner.summonerLevel;
        const averageK = total_kills / total_games;
        const averageD = total_deaths / total_games;
        const averageA = total_assists / total_games;
        //const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${profileIconId}.png`;

        const playerEmbed = new EmbedBuilder()
            .setTitle(`${username} - League Stats`)
            .setColor(0x0099FF)
            //.setThumbnail(profileIconUrl)
            .addFields(
                //{ name: '🎯 Level', value: `${level}`, inline: true },
                { name: '📊 Win Rate', value: `${(win_rate * 100).toFixed(1)}%`, inline: true },
                { name: '⚔️ KDA', value: kdaDisplay, inline: true }, 
                { name: '🎮 Games Played', value: `${total_games}`, inline: true },
                { name: '📈 KDA Ratio', value: `${((averageK + averageA) / averageD).toFixed(2)}`, inline: true }
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

async function getSummonerData(encrypt_summon) {
    console.log(encrypt_summon);
    const reponse = await fetch(`${process.env.LOL_BASE_URL}/lol/summoner/v4/summoners/by-account/${encrypt_summon}`, {
        headers: { 'X-Riot-Token': process.env.LOL_KEY },
    });

    const data = await reponse.json();

    return data;
}

async function getRankData(summoner) {
    console.log(summoner);
    //const response = await fetch(`${process.env.LOL_BASE_URL}/league/v4/entries/by-summoner/${summoner.id}`, {
    //    headers: { 'X-Riot-Token': process.env.LOL_KEY },
    //});
    //const data = await response.json();
    //console.log(data);
    //return data;
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

