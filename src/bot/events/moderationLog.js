const { Events, EmbedBuilder } = require('discord.js');
const { Configurations } = require('../../models');
/* TODO: Track bans
/* TODO: Track role changes 
/* TODO: Track message deletions 
*/

const ModerationLog = {
    async logRoleUpdate(oldMember, newMember, roleId, added=true) {
        const guild = oldMember.guild || newMember.guild;
        const role = guild.roles.cache.get(roleId);
        const user = newMember.user || oldMember.user;
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('Role Updated')
            .setDescription(`${user} has ${added ? 'added' : 'removed'} the role ${role ? role.name : 'Unknown Role'}`)
            .setColor(role ? role.color : '#7289DA')
            .setTimestamp();

        const config = await Configurations.findOne({ where: { field: 'moderation_channel' } });
        if (!config) return;
        const channel = await guild.client.channels.fetch(config.channel);

        if (channel) {
            channel.send({ embeds: [embed] });
        }
    },
    async logMessageDeletion(message) {
        const guild = message.guild;
        const user = message.author;
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('Message Deleted')
            .setDescription(`A message by ${user} was deleted in <#${message.channel.id}>`)
            .addFields({ name: 'Content', value: message.content || '*No content*' })
            .setColor('#ED4245')
            .setTimestamp();

        const config = await Configurations.findOne({ where: { field: 'moderation_channel' } });
        if (!config) return;
        const channel = await guild.client.channels.fetch(config.channel);

        if (channel) {
            channel.send({ embeds: [embed] });
        }
    }
};

module.exports = ModerationLog;
