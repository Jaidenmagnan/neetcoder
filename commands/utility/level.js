const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('check the level of your user'),
    async execute(interaction) {
        let user = await Users.findOne({ where: { userid: interaction.user.id } });

        if (!user) {
            user = await Users.create({
                userid: interaction.user.id,
                message_count: 0,
                level: 1,
            });
        }

        await interaction.reply(`You are level, ${user.level}`);

    },
};