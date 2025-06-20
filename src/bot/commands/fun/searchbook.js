const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

let fetch;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('searchbook')
    .setDescription('Search for a book using Google Books API')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the book to search')
        .setRequired(true)
    ),

    async execute(interaction) {
      const title = interaction.options.getString('title');
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&key=${apiKey}`;
    
      if (!fetch) {
        fetch = (await import('node-fetch')).default;
      }
    
      try {
        const res = await fetch(url);
        const data = await res.json();
    
        if (!data.items || data.items.length === 0) {
          // Reply once if no results
          return await interaction.reply({ content: `❌ No results found for "${title}".`, ephemeral: true });
        }
    
        const book = data.items[0].volumeInfo;
    
        const embed = new EmbedBuilder()
          .setTitle(book.title || 'Unknown Title')
          .setURL(book.infoLink || null)
          .setDescription(book.description ? book.description.slice(0, 300) + '...' : 'No description available.')
          .setThumbnail(book.imageLinks?.thumbnail)
          .addFields(
            { name: 'Author(s)', value: book.authors?.join(', ') || 'Unknown', inline: true },
            { name: 'Published', value: book.publishedDate || 'Unknown', inline: true },
            { name: 'Page Count', value: book.pageCount?.toString() || 'N/A', inline: true }
          )
          .setColor('Random');
    
        // Try to reply and catch reply-specific errors
        try {
          await interaction.reply({ embeds: [embed] });
        } catch (err) {
          console.error('❌ Failed to reply with embed:', err);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Failed to send book embed.', ephemeral: true });
          }
        }
    
      } catch (err) {
        console.error('❌ Error while fetching book:', err);
    
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Something went wrong while searching.', ephemeral: true });
        }
      }
    }
    
};
