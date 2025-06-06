const { Events, ActivityType } = require('discord.js');
const { Users, Configurations, ReactionRoles, Votes, StravaUsers, RunChannels, Books } = require('../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        Users.sync({ alter: true });
        Configurations.sync({ alter: true });
        ReactionRoles.sync({ alter: true });
        Votes.sync();
        Books.sync();
	
	client.user.setPresence({
		activities: [{
			type: ActivityType.Custom,
			name: 'Learn from yesterday'

		}]
	});



        console.log(`Ready! Logged in as ${client.user.tag}`);

    },
};
