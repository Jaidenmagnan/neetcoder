const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let fetch;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fnshop')
    .setDescription('Show today’s Fortnite Item Shop'),

  async execute(interaction) {
    if (!fetch) fetch = (await import('node-fetch')).default;

    await interaction.deferReply();

    try {
      const res = await fetch('https://fortnite-api.com/v2/shop');
      const json = await res.json();

      let entries = json.data?.featured?.entries;

      // Fallback if featured is missing
      if (!Array.isArray(entries)) {
        entries = json.data?.entries || [];
      }

      if (!Array.isArray(entries) || entries.length === 0) {
        console.error('Unexpected shop structure:', JSON.stringify(json, null, 2));
        return interaction.editReply('❌ Could not fetch any items from the shop.');
      }

      shuffleArray(entries); 

      const embeds = [];

      entries.slice(0, 5).forEach(entry => {
        const item = entry.brItems?.[0]; 
        const name = item?.name || 'Unknown Item';
        const price = entry.finalPrice || 'N/A';
        const image = item?.images?.icon || null;

        const embed = new EmbedBuilder()
          .setTitle(`${name}`)
          .setDescription(`${price} V-Bucks`)
          .setColor('#00AEEF')
          .setFooter({ text: 'Powered by fortnite-api.com' })
          .setTimestamp();

        if (image) {
          embed.setThumbnail(image);
        }

        embeds.push(embed);
      });

      await interaction.editReply({ embeds });

    } catch (err) {
      console.error('Error fetching shop:', err);
      await interaction.editReply('❌ Something went wrong retrieving the shop.');
    }
  }
};
