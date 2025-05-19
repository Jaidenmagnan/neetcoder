const { Events } = require('discord.js');
const { Users } = require('../models.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log("message received");

        try {
            await logXp(message);
        }
        catch (error) {
            console.error("Error logging XP:", error);
        };


        if (message.content == "<@1373490238277550202> reload") {
            // check message author
            if (message.author == "314903883874828288" || message.author == "530872774986694656") {
                console.log("reloading commands");
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