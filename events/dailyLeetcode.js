const { Events } = require('discord.js');
const { Configurations } = require('../models.js');
const TurndownService = require('turndown');

const turndownService = new TurndownService({
    codeBlockStyle: 'fenced',
    headingStyle: 'atx',
    bulletListMarker: '•',
});

// Configure Turndown for Discord-specific formatting
turndownService.addRule('codeBlocks', {
    filter: ['pre', 'code'],
    replacement: function(content, node) {
        if (node.parentNode && node.parentNode.nodeName === 'PRE') {
            return '\n```\n' + content + '\n```\n';
        }
        return '`' + content + '`';
    },
});

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        scheduleDailyLeetCode(client);
    },
};

function scheduleDailyLeetCode(client) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0); // 9:00 AM

    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilExecution = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
        postDailyLeetCode(client);
        setInterval(() => {
            postDailyLeetCode(client);
        }, 24 * 60 * 60 * 1000);
    }, timeUntilExecution);
}

async function postDailyLeetCode(client) {
    try {
        const response = await fetch('https://alfa-leetcode-api.onrender.com/daily');
        const problem = await response.json();

        const formattedDescription = turndownService.turndown(problem.question);

        const embed = {
            title: `Daily LeetCode Problem: ${problem.questionTitle}`,
            description: `**Difficulty:** ${problem.difficulty}\n\n**Problem Description:**\n${formattedDescription}\n\n**Link:** ${problem.questionLink}`,
            color: getDifficultyColor(problem.difficulty),
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Daily LeetCode Challenge',
            },
        };

        const guilds = client.guilds.cache;
        
        for (const [guildId, guild] of guilds) {
            const config = await Configurations.findOne({
                where: {
                    field: 'leetcode_channel',
                    guildid: guildId,
                },
            });

            if (config && config.channel) {
                const channel = await guild.channels.fetch(config.channel);
                if (channel) {
                    const message = await channel.send({ embeds: [embed] });
                    await message.startThread({
                        name: `Daily Challenge: ${problem.questionTitle}`,
                        autoArchiveDuration: 1440,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error posting daily LeetCode problem:', error);
    }
}
function getDifficultyColor(difficulty) {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 0x98FB98; // Pale Green
        case 'medium':
            return 0xFFB6C1; // Light Pink
        case 'hard':
            return 0xFFA07A; // Light Salmon
        default:
            return 0xD3D3D3; // Light Gray
    }
}

//function getDifficultyColor(difficulty) {
//    switch (difficulty.toLowerCase()) {
//        case 'easy':
//            return 0x00ff00;
//        case 'medium':
//            return 0xffa500;
//        case 'hard':
//            return 0xff0000;
//        default:
//            return 0x808080;
//    }
//} 