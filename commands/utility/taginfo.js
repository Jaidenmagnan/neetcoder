
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taginfo')
        .setDescription('fetches a tag ')

        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the tag')),

    async execute(interaction, Tags) {
        const tagName = interaction.options.getString('name');

        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag = await Tags.findOne({ where: { name: tagName } });

        if (tag) {
            return interaction.reply(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
        }

        return interaction.reply(`Could not find tag: ${tagName}`);

    },
};