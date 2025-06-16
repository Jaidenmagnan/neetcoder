const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('NO MORE MUSIC!'),

    async execute(interaction) {
        // STOP COMMAND
    }
}