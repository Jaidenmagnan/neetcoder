const { Events } = require('discord.js');
const { RoleGroups, Roles } = require('../../models.js');

function extractDiscordEmojiId(reaction) {
    if (!reaction.id) {
        return reaction.name;
    }
    return reaction.id;
}

module.exports = {
    name: Events.MessageReactionRemove,
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
                    await member.roles.remove(role);
                    console.log(`Removed role ${role.name} from ${user.tag}`);
                }
            } catch {
                console.log('error removing reaction role');
            }
        }
    },
};
