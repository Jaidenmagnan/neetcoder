const { SlashCommandBuilder } = require('discord.js');
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Post today\'s LeetCode problem'),

    async execute(interaction) {
        await interaction.deferReply();

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

            const message = await interaction.channel.send({ embeds: [embed] });
            await message.startThread({
                name: `Daily Challenge: ${problem.questionTitle}`,
                autoArchiveDuration: 1440,
            });

            await interaction.editReply('Posted today\'s LeetCode problem!');
        } catch (error) {
            console.error('Error posting daily LeetCode problem:', error);
            await interaction.editReply('There was an error fetching the daily problem. Please try again later.');
        }
    },
}; 