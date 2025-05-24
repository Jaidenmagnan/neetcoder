const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction_role_add')
        .setDescription('Will add a reaction role')

    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};