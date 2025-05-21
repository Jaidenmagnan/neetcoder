const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models.js');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('check the level of your user'),
    async execute(interaction) {
        await interaction.deferReply();
        let user = await Users.findOne({ where: { userid: interaction.user.id } });

        if (!user) {
            user = await Users.create({
                userid: interaction.user.id,
                message_count: 0,
                level: 1,
            });
        }

        const level_card = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`** AURA LEVEL ${await user.get('level')}**`)
            .setTimestamp();

        await interaction.editReply({ embeds: [level_card] });

    },
};