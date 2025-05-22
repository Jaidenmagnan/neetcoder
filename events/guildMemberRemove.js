const { Events } = require('discord.js');
const { Configurations } = require('../models.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        console.log(`LEFT`);

        const channel = await member.client.channels.fetch(
    (await Configurations.findOne({ where: { 'field': 'welcome_channel' } })).channel);


        if (channel) {
            await channel.send('LEFT');
        }
        else {
            console.log('Channel not found');
        }


    },
};