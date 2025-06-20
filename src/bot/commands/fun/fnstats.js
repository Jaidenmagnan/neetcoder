const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fnstats')
    .setDescription('Get Fortnite stats for a player.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Epic Games username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Platform (epic, xbox, psn)')
        .setRequired(true)
        .addChoices(
          { name: 'Epic Games', value: 'epic' },
          { name: 'Xbox', value: 'xbl' },
          { name: 'PlayStation', value: 'psn' }
        )
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const platform = interaction.options.getString('platform');
    const API_KEY = process.env.FORTNITE_API_KEY;

    await interaction.deferReply(); // Prevents InteractionAlreadyReplied error

    try {
      const res = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${username}&accountType=${platform}`, {
        headers: {
          Authorization: API_KEY
        }
      });

      const data = await res.json();
      if (!data.data) {
        return interaction.editReply({ content: `❌ No stats found for **${username}**.` });
      }

      const stats = data.data.stats.all.overall;
      const icon = data.data.account.icon || 'https://fortnite-api.com/images/icon.png';

      const embed = new EmbedBuilder()
        .setTitle(`🔷 Fortnite Stats — ${data.data.account.name}`)
        .setThumbnail(icon)
        .setColor('#5db9ff')
        .addFields(
          { name: '🏆 Wins', value: `${stats.wins}`, inline: true },
          { name: '🎮 Matches', value: `${stats.matches}`, inline: true },
          { name: '📈 Win Rate', value: `${stats.winRate.toFixed(2)}%`, inline: true },
          { name: '☠️ Kills', value: `${stats.kills}`, inline: true },
          { name: '⚔️ K/D', value: `${stats.kd.toFixed(2)}`, inline: true },
          { name: '⏱️ Time Played', value: `${(stats.minutesPlayed / 60).toFixed(1)} hrs`, inline: true }
        )
        .setFooter({
          text: `Epic ID: ${data.data.account.name}`,
          iconURL: icon
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching Fortnite stats:', error);
      await interaction.editReply({ content: '❌ Something went wrong while fetching stats.' });
    }
  }
};
