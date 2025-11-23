const { Events } = require('discord.js');
const { RoleGroups, Roles } = require('../../models.js');

function extractDiscordEmojiId(reaction) {
    if (!reaction.id) {
        return reaction.name;
    }
    return reaction.id;
}

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            await reaction.fetch();
        }

        const emojiString = extractDiscordEmojiId(reaction.emoji);

        const roleGroup = await RoleGroups.findOne({
            where: {
                messageId: reaction.message.id,
                guildId: reaction.message.guild.id,
            },
        });

        if (roleGroup) {
            try {
                const reactionRole = await Roles.findOne({
                    where: {
                        guildId: reaction.message.guild.id,
                        roleGroupId: roleGroup.id,
                        emoji: emojiString,
                    },
                });

                const member = await reaction.message.guild.members.fetch(
                    user.id
                );
                const role = await reaction.message.guild.roles.cache.get(
                    reactionRole.roleId
                );

                if (role && member) {
                    await member.roles.add(role);
                    console.log(`Added role ${role.name} to ${user.tag}`);
                }
            } catch (err) {
                console.log('error adding reaction role');
            }
        }
    },
};
