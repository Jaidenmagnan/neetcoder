
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edittag')
        .setDescription('edits a tag ')

        .addStringOption(option =>
            option.setName('name')
                .setDescription('the name of the tag'))

        .addStringOption(option =>
            option.setName('description')
                .setDescription('new description for the tag')),

    async execute(interaction, Tags) {
        const tagName = interaction.options.getString('name');
        const tagDescription = interaction.options.getString('description');

        // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
        const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });

        if (affectedRows > 0) {
            return interaction.reply(`Tag ${tagName} was edited.`);
        }

        return interaction.reply(`Could not find a tag with name ${tagName}.`);
    },
};