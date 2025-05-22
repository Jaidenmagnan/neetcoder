const { SlashCommandBuilder } = require('discord.js');
const { getNBAScore } = require('../utility/sports.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nba')
        .setDescription('Get the current NBA game score for a team')
        .addStringOption(option =>
            option.setName('team')
                .setDescription('The NBA team name (e.g., Lakers)')
                .setRequired(true)),
    async execute(interaction) {
        const teamName = interaction.options.getString('team');
        await interaction.deferReply();

        try {
            const result = await getNBAScore(teamName);
            await interaction.editReply(result);
        } catch (err) {
            console.error(err);
            await interaction.editReply('Sorry, something went wrong.');
        }
    },
};
