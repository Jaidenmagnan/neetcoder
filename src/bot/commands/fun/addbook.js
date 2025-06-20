const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Books } = require('../../../models.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addbook')
    .setDescription('Add a book to your TBR list')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('The title of the book')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const title = interaction.options.getString('title');

    try {
      await Books.create({
        user_id: userId,
        title,
        status: 'unread',
      });

      await interaction.reply({
        content: `✅ Added **${title}** to your TBR list.`,
        flags: MessageFlags.Ephemeral // correct way to hide response
      });

    } catch (error) {
      console.error('Error adding book:', error);

      const replyContent = {
        content: '❌ Failed to add the book.',
        flags: MessageFlags.Ephemeral
      };

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(replyContent);
      } else {
        await interaction.followUp(replyContent);
      }
    }
  },
};
