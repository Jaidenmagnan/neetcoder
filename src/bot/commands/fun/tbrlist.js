const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Books } = require('../../../models.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tbrlist')
    .setDescription('DMs you your to-be-read (TBR) book list'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const books = await Books.findAll({ where: { user_id: userId } });

      if (books.length === 0) {
        return interaction.reply({ 
          content: 'Your TBR list is empty!', 
          flags: MessageFlags.Ephemeral 
        });
      }

      const unreadBooks = books.filter(b => b.status === 'unread');
      const readBooks = books.filter(b => b.status === 'read');

      const formatBooks = (arr, emoji) =>
        arr.map((b, i) => `${emoji} ${i + 1}. ${b.title}`).join('\n');

      let message = `**Your TBR List**\n\n`;

      if (unreadBooks.length > 0) {
        message += `**Unread:**\n${formatBooks(unreadBooks, '📖')}\n\n`;
      }
      if (readBooks.length > 0) {
        message += `**Read:**\n${formatBooks(readBooks, '✅')}`;
      }

      await interaction.user.send(message);
      await interaction.reply({ 
        content: 'Sent!', 
        flags: MessageFlags.Ephemeral 
      });

    } catch (error) {
      console.error(error);
      try {
        await interaction.reply({ 
          content: '❌ Failed to fetch your list or send a DM.', 
          flags: MessageFlags.Ephemeral 
        });
      } catch (e) {
        console.error('❗ Reply failed:', e);
      }
    }
  },
};
