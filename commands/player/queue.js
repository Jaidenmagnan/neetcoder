const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shows current queue')
        .setDescription('with the bot'),

    async execute(interaction) {
        // QUEUE COMMAND
    }
}