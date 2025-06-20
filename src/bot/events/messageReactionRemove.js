const { Events } = require('discord.js');
const { ReactionRoles } = require('../../models.js');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        if (user.bot) return;

        if (reaction.partial) {
            await reaction.fetch();
        }

        const emojiString = reaction.emoji.id ?
            `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` :
            reaction.emoji.name;

        const reactionRole = await ReactionRoles.findOne({
            where: {
                messageid: reaction.message.id,
                guildid: reaction.message.guild.id,
                emoji: emojiString,
            },
        });

        if (reactionRole) {
            try {
                const member = await reaction.message.guild.members.fetch(user.id);
                const role = reaction.message.guild.roles.cache.get(reactionRole.roleid);

                if (role && member) {
                    await member.roles.remove(role);
                    console.log(`Removed role ${role.name} from ${user.tag}`);
                }
            }
            catch {
                console.log('error removing reaction role');
            }
        }
    },
};