const { Events } = require('discord.js');
const { Users, Configurations, ReactionRoles, Votes, StravaUsers, RunChannels } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ alter: true });
        Configurations.sync({ alter: true });
        ReactionRoles.sync({ alter: true });
        Votes.sync();
        StravaUsers.sync();
        RunChannels.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};