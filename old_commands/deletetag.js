const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletetag')
        .setDescription('edits a tag ')

        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the tag')),

    async execute(interaction, Tags) {
        const tagName = interaction.options.getString('name');
        // equivalent to: DELETE from tags WHERE name = ?;
        const rowCount = await Tags.destroy({ where: { name: tagName } });

        if (!rowCount) return interaction.reply('That tag doesn\'t exist.');

        return interaction.reply('Tag deleted.');
    },
};