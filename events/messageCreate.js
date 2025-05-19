
const { Events } = require('discord.js');
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log("message received");

        if (message.content == "<@1373490238277550202> reload") {
            // check message author
            if (message.author == "314903883874828288" || interaction.message.author == "530872774986694656") {
                console.log("reloading commands");
                if (message.author == "314903883874828288") {
                    message.reply("Jaiden ur fucking weird");
                }
                else {
                    message.reply("wsg gang");
                }
            }
            else {
                console.log("incorrect user");
                message.reply("You can't run this command");
            }
        }

    },
};