const { Events } = require('discord.js');
const { Users, Configurations, ReactionRoles, StravaUsers } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync();
        Configurations.sync();
        ReactionRoles.sync();
        StravaUsers.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};