const { Events, EmbedBuilder } = require('discord.js');
const { Configurations } = require('../../models.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = await member.client.channels.fetch(
            (
                await Configurations.findOne({
                    where: { field: 'welcome_channel' },
                })
            ).channel
        );

        if (channel) {
            const welcome_card = new EmbedBuilder()
                .setColor('#87d68d')
                .setTitle('Welcome!')
                .addFields(
                    { name: 'User:', value: member.user.tag, inline: true },
                    { name: 'ID:', value: member.user.id, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    {
                        name: 'Created:',
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                        inline: true,
                    },
                    {
                        name: 'Members:',
                        value: member.guild.memberCount.toString(),
                        inline: true,
                    }
                )
                .setThumbnail(
                    member.user.displayAvatarURL({ dynamic: true, size: 256 })
                )
                .setTimestamp(member.joinedTimestamp);

            await channel.send({ embeds: [welcome_card] });
        } else {
            console.log('Welcome channel not defined.');
        }
    },
};
