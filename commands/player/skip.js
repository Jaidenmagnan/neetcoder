const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('admin instantly does it, otherwise requires 2 votes'),

    async execute(interaction) {
        // SKIP COMMAND
    }
}