import { SlashCommandBuilder } from 'discord.js';
import { getNBAScore } from 'nba.js'; 

export default {
  data: new SlashCommandBuilder()
    .setName('nba')
    .setDescription('Get the NBA score for a team')
    .addStringOption(option =>
      option.setName('team')
        .setDescription('NBA team name (e.g., Knicks, Lakers)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const teamName = interaction.options.getString('team');
    const result = await getNBAScore(teamName);
    await interaction.reply(result);
  },
};
