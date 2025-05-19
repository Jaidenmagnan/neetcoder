const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('check the level of your user'),
    async execute(interaction) {

        await interaction.reply('Pong!');
    },
};