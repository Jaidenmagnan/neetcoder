const { Events } = require('discord.js');
const { Users, Configurations } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ force: true });
        //Configurations.sync({ force: true });
        Configurations.sync();
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};