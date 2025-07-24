const { Events } = require('discord.js');
const { logRoleUpdate } = require('../events/moderationLog');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const guild = oldMember.guild;
        await guild.roles.fetch();
        guild.roles.cache.forEach((role) => {
            if (
                oldMember.roles.cache.has(role.id) &&
                !newMember.roles.cache.has(role.id)
            ) {
                logRoleUpdate(oldMember, newMember, role.id, false);
            }

            if (
                !oldMember.roles.cache.has(role.id) &&
                newMember.roles.cache.has(role.id)
            ) {
                logRoleUpdate(oldMember, newMember, role.id, true);
            }
        });
    },
};
