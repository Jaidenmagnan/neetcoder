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
        const profile_name = interaction.options.getString('summoner_name');
        const tag = interaction.options.getString('tag').replace('#', '');

        const puuid = await getLolPuuid(profile_name, tag);
        const match_ids = await getMatchIds(puuid);
        const match_data = await getMatchData(match_ids[0]);
        console.log(match_ids[0]);

        console.log(match_data.info.participants);

    },
};

async function getLolPuuid(name, tag) {
    const response = await fetch(`${process.env.LOL_BASE_URL}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, {
        headers: { 'X-Riot-Token': process.env.LOL_KEY },
    });

    const data = await response.json();

    return data.puuid;
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
        headers: { 'X-Riot-Token' : process.env.LOL_KEY }, 
    });

    const match_data = await response.json();
    return match_data;

}