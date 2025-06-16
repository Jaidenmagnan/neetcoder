const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('with the bot')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('what to search for')
                .setRequired(true)
        ),

    async execute(interaction) {
        // PLAY COMMAND
    }
}