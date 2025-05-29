const { Events } = require('discord.js');
const { Users, Configurations, ReactionRoles, Votes, Books } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ alter: true });
        Configurations.sync({ alter: true });
        ReactionRoles.sync({ alter: true });
        Votes.sync();
        Books.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};