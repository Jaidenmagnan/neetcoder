
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showtags')
        .setDescription('fetches a tag '),

    async execute(interaction, Tags) {
        // equivalent to: SELECT name FROM tags;
        const tagList = await Tags.findAll({ attributes: ['name'] });
        const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';

        return interaction.reply(`List of tags: ${tagString}`);

    },
};