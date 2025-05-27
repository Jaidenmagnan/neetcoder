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
        return interaction.reply(`❌ No results found for "${title}".`);
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

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply('❌ Something went wrong while fetching the book.');
    }
  }
};
