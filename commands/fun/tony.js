const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tony')
    .setDescription('Replies with :tonyfreaky:'),
  async execute(interaction) {
    await interaction.reply('<:tonyfreaky:1364665263877918821>');
  },
};