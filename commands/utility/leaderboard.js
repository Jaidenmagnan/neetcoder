const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../models.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('check the server stats'),
    async execute(interaction) {
        await interaction.deferReply();

        const users = await Users.findAll({
            where: {
                guildid: interaction.guild.id,
            },
            order: [['level', 'DESC']],
            limit: 10,
        });

        const standings = new EmbedBuilder()
            .setTitle('WHO HAS THE MOST AURA?')
            .setColor('#B8D4F0')
            .setTimestamp();

        for (let i = 0; i < Math.min(5, users.length); i++) {
            const user = users[i];
            let trophy = '';

            if (i === 0) trophy = '🥇';
            else if (i === 1) trophy = '🥈';
            else if (i === 2) trophy = '🥉';

            standings.addFields({
                name: `${trophy} #${i + 1}`,
                value: `<@${user.get('userid')}> - ${user.get('level')} aura`,
                inline: false,
            });
        }

        await interaction.editReply({ embeds: [standings] });

    },
};