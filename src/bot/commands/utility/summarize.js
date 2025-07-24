const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('summarize the last 30 messages in the channel.'),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const messages = await interaction.channel.messages.fetch({
                limit: 30,
            });
            const messageContent = messages
                .map(
                    (message) =>
                        `${message.author.username}: ${message.content}`
                )
                .join('\n');
            const summary = await openai.chat.completions.create({
                model: 'gpt-4.1-nano',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a helpful assistant that summarizes conversations. Provide a concise pretty, and organized summary of the following messages, highlighting the main points and key discussion topics.',
                    },
                    {
                        role: 'user',
                        content: `Please summarize these messages:\n\n${messageContent}`,
                    },
                ],
            });
            await interaction.editReply(summary.choices[0].message.content);
        } catch (error) {
            console.error('Error in summarize command:', error);
            await interaction.editReply(
                'there was an error summarizing the messages!'
            );
        }
    },
};
