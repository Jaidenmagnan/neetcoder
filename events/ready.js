const { Events } = require('discord.js');
const { Users, Configurations, ReactionRoles, Votes } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ alter: true });
        Configurations.sync({ alter: true });
        ReactionRoles.sync({ alter: true });
        Votes.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};