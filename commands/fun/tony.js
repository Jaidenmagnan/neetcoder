const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tony')
    .setDescription('Replies with :tonyfreaky:'),
  async execute(interaction) {
    await interaction.reply('<:tonyfreaky:1364665263877918821>');
  },
};

// it is actually not a fun command that can be used in any channel