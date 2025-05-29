const { SlashCommandBuilder } = require('discord.js');
const { Books } = require('../../models.js'); 

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

      await interaction.reply(`✅ Added **${title}** to your TBR list.`);
    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Failed to add the book.');
    }
  },
};
