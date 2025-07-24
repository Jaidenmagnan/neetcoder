const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../../models.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('check the level of your user')

        .addUserOption((option) =>
            option
                .setName('username')
                .setDescription('whoevers level you are checking')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user_to_find = interaction.options.getUser('username');
        await interaction.deferReply();

        let user = null;
        let userid = null;
        if (user_to_find) {
            user = await Users.findOne({
                where: {
                    userid: user_to_find.id,
                    guildid: interaction.guild.id,
                },
            });
            userid = user_to_find.id;
        } else {
            user = await Users.findOne({
                where: {
                    userid: interaction.user.id,
                    guildid: interaction.guild.id,
                },
            });
            userid = interaction.user.id;
        }

        if (!user) {
            user = await Users.create({
                userid: userid,
                guildid: interaction.guild.id,
                message_count: 0,
                level: 1,
            });
        }

        const name = await interaction.client.users.fetch(userid);
        const level_card = new EmbedBuilder()
            .setAuthor({
                name: name.displayName,
                iconURL: name.displayAvatarURL(),
            })
            .setDescription(`** AURA LEVEL ${await user.get('level')}**`)
            .setTimestamp();

        await interaction.editReply({ embeds: [level_card] });
    },
};
