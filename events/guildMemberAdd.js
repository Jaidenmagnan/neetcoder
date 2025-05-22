const { Events } = require('discord.js');
const { Configurations } = require('../models.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        console.log(`JOINED`);

        const channel = await member.client.channels.fetch(
    (await Configurations.findOne({ where: { 'field': 'welcome_channel' } })).channel);


        if (channel) {
            await channel.send('JOINED');
        }
        else {
            console.log('Channel not found');
        }


    },
};