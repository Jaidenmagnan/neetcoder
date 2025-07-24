const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('ask a question and get a response')
        .addStringOption((option) =>
            option.setName('prompt').setDescription('prompt').setRequired(true)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral,
            });
            const prompt = interaction.options.getString('prompt');

            const messages = await interaction.channel.messages.fetch({
                limit: 20,
            });
            const messageContext = messages
                .map(
                    (message) =>
                        `${message.author.username}: ${message.content}`
                )
                .join('\n');

            const response = await openai.chat.completions.create({
                model: 'gpt-4.1-nano',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a helpful assistant. Use the conversation context to provide more relevant and contextual responses if you feel needed. Keep your answers clear and concise.',
                    },
                    {
                        role: 'user',
                        content: `Recent conversation context:\n${messageContext}\n\nQuestion: ${prompt}`,
                    },
                ],
            });

            await interaction.editReply(response.choices[0].message.content);
        } catch (error) {
            console.error('Error in ask command:', error);
            await interaction.editReply(
                'there was an error processing your question!'
            );
        }
    },
};
