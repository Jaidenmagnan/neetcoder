const { MessageFlags, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('waifu')
        .setDescription('get an anime waifu'),
    async execute(interaction) {
        const request = await fetch(`${process.env.WAIFU_BASE_URL}/v4/images/random?rating=safe&limit=1`);
        const data = await request.json();

        const embed = new EmbedBuilder()
            .setTitle('uwu')
            .setImage(data[0].url)
            .setColor(0xFFC0CB);

        await interaction.reply({
            content: "sure thing dad!",
            flags: MessageFlags.Ephemeral,
        });
        await interaction.channel.send({ embeds: [embed] });
    },
};