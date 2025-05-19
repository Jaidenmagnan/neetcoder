const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtag')
        .setDescription('adds a tag to the database')

        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the tag'))

        .addStringOption(option =>
            option.setName('description')
                .setDescription('the description of the tag')),

    async execute(interaction, Tags) {
        const tagName = interaction.options.getString('name');
        const tagDescription = interaction.options.getString('description');

        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
            const tag = await Tags.create({
                name: tagName,
                description: tagDescription,
                username: interaction.user.username,
            });

            return interaction.reply(`Tag ${tag.name} added.`);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.reply('That tag already exists.');
            }

            return interaction.reply('Something went wrong with adding a tag.');
        }
    },
};