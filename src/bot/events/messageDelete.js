const { Events } = require('discord.js');
const { logMessageDeletion } = require('../events/moderationLog');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.content.includes('https://x.com')) {
            try {
                logMessageDeletion(message);
            } catch (error) {
                console.log(error);
            }
        }

        // check if message is from neetcoder
        if (message.author.id === '1375510601345794078') {
            // announcements channel
            const channel = await message.guild.channels.fetch(
                '1098986325560000592'
            );
            if (channel) {
                // silenced by theo
                channel.send(
                    'I WAS SILENCED'
                );
            }
        }
    },
};
