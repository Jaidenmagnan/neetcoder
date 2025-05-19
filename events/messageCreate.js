const { Events } = require('discord.js');
const { Users } = require('../models.js');
const { generateMadLibs } = require('../commands/fun/madlibs.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log("message received");

        if (message.author.bot) return;

        if (message.content == "<@1373490238277550202> reload") {
            // check message author
            const { loadCommands, loadEvents } = require('../index.js');
            if (message.author == "314903883874828288" || message.author == "530872774986694656") {
                console.log("reloading commands & events");
                loadCommands();
                loadEvents();
                if (message.author == "314903883874828288") {
                    message.reply("omar is cringe");
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

        if (message.mentions.everyone) {
            try {
                const madLibsStory = generateMadLibs(message.author.username, message.author.id);
                if (madLibsStory && madLibsStory.trim() !== '') {
                    await message.channel.send(madLibsStory);
                } else {
                    console.error('Empty story generated');
                    await message.channel.send("Oops! The story generator had a brain fart. Please try again!");
                }
            } catch (error) {
                console.error('Error in message handler:', error);
                await message.channel.send("Oops! Something went wrong. Please try again!");
            }
        }

        try {
            await logXp(message);
        }
        catch (error) {
            console.error("Error logging XP:", error);
        };
    },
};

function step(level, message_count) {
    points = [
        [1, 5],
        [2, 25],
        [3, 50],
        [4, 50],
    ]
    if (level <= 4) {
        for (let i = 0; i < points.length - 1; i++) {
            if (message_count >= (points[i][1])) {
                level = points[i][0];
            }
        }
    }
    else {
        level = 4 + (((message_count) - 130) % 100);
    }
    return level;

}
async function logXp(message) {
    let user = await Users.findOne({ where: { userid: message.author.id } });

    if (!user) {
        user = await Users.create({
            userid: message.author.id,
            message_count: 0,
            level: 1,
        });
    }

    user.increment('message_count');
};