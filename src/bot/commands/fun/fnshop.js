const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
  } = require('discord.js');
  
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
  
        if (!Array.isArray(entries)) {
          entries = json.data?.entries || [];
        }
  
        if (!Array.isArray(entries) || entries.length === 0) {
          console.error('Unexpected shop structure:', JSON.stringify(json, null, 2));
          return interaction.editReply('❌ Could not fetch any items from the shop.');
        }
  
        shuffleArray(entries);
  
        let index = 0;
  
        const buildEmbed = (entry, i) => {
          const item = entry.brItems?.[0];
          const name = item?.name || 'Unknown Item';
          const price = entry.finalPrice || 'N/A';
          const image = item?.images?.icon || null;
  
          const embed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(`${price} V-Bucks`)
            .setColor('#00AEEF')
            .setFooter({ text: `Item ${i + 1} of ${entries.length} • Powered by fortnite-api.com` })
            .setTimestamp();
  
          if (image) embed.setThumbnail(image);
          return embed;
        };
  
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀️ Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Primary)
        );
  
        const message = await interaction.editReply({
          embeds: [buildEmbed(entries[index], index)],
          components: [row],
        });
  
        const collector = message.createMessageComponentCollector({
          time: 60_000, // 60 seconds
        });
  
        collector.on('collect', async (btnInteraction) => {
          if (btnInteraction.user.id !== interaction.user.id) {
            return btnInteraction.reply({
              content: "You can't control this interaction.",
              ephemeral: true,
            });
          }
  
          if (btnInteraction.customId === 'next') {
            index = (index + 1) % entries.length;
          } else if (btnInteraction.customId === 'prev') {
            index = (index - 1 + entries.length) % entries.length;
          }
  
          const newRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(index === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(index === entries.length - 1)
          );
  
          await btnInteraction.update({
            embeds: [buildEmbed(entries[index], index)],
            components: [newRow],
          });
        });
  
        collector.on('end', async () => {
          const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          );
  
          await message.edit({
            components: [disabledRow],
          });
        });
      } catch (err) {
        console.error('Error fetching shop:', err);
        await interaction.editReply('❌ Something went wrong retrieving the shop.');
      }
    },
  };
  