const { Events } = require('discord.js');
const { Users, Configurations, ReactionRoles } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ force: true });
        Configurations.sync({ force: true });
        ReactionRoles.sync({ force: true });
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};