const { Events, ActivityType } = require('discord.js');
const { Guilds, Users, ChannelStats, Configurations, Roles, RoleGroups, Votes, Books, UserAuth } = require('../../models.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        await Users.sync({ alter: true });
        await Configurations.sync({ alter: true });
		await ChannelStats.sync({alter: true});
        await Roles.sync({ alter: true });
		await RoleGroups.sync({ alter: true });
        await UserAuth.sync({ alter: true });
        await Votes.sync();
        await Books.sync();
        await Guilds.sync({ alter: true });

        console.log('Database synced successfully.');

        client.guilds.cache.forEach(async guild => {
            const existingGuild = await Guilds.findOne({ where: { guildid: guild.id } });
            if (!existingGuild) {
                await Guilds.create({
                    guildid: guild.id,
                    guildname: guild.name,
                    guildicon: guild.icon
                });
                console.log(`Guild ${guild.name} (${guild.id}) added to the database.`);
            }
        })

	
	client.user.setPresence({
		activities: [{
			type: ActivityType.Custom,
			name: 'Learn from yesterday'

		}]
	});



        console.log(`Ready! Logged in as ${client.user.tag}`);

    },
};
