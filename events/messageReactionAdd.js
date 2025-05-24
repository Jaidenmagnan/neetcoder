const { Events } = require('discord.js');
const { ReactionRoles } = require('../models.js');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // Ignore bot reactions
        if (user.bot) return;

        // Get the emoji string (works for both Unicode and custom emojis)
        const emojiString = reaction.emoji.id ?
            `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` :
            reaction.emoji.name;

        console.log("HI HI HI");
        
        try {
            // Check if this reaction matches a reaction role
            const reactionRole = await ReactionRoles.findOne({
                where: {
                    messageid: reaction.message.id,
                    guildid: reaction.message.guild.id,
                    emoji: emojiString,
                },
            });

            if (reactionRole) {
                // Get the guild member
                const member = await reaction.message.guild.members.fetch(user.id);
                // Get the role
                const role = reaction.message.guild.roles.cache.get(reactionRole.roleid);
                if (role && member) {
                    // Add the role to the member
                    await member.roles.add(role);
                    console.log(`Added role ${role.name} to ${user.tag}`);
                }
                else {
                    console.log('Role or member not found');
                }
            }
        }
        catch (error) {
            console.error('Error handling reaction role add:', error);
        }
    },
};