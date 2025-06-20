const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    // use a \n to do a new line
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('sends a message from the bot')

        .addStringOption(option =>
            option.setName('message')
                .setDescription('this is the message we will send in the embed')
                .setRequired(true))

        .addStringOption(option =>
            option.setName('color')
                .setDescription('input the color in hex')
                .setRequired(true))

        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('the channel the message will be sent in.')
                .setRequired(true)),

    async execute(interaction) {
        const message = interaction.options.getString('message').replace(/\\n/g, '\n');
        const colorCode = interaction.options.getString('color');
        const targetChannel = interaction.options.getChannel('channel');

        try {
            const color = colorCode.replace('#', '');

            // Validate hex color code
            if (!/^[0-9A-F]{6}$/i.test(color)) {
                await interaction.reply({
                    content: 'invalid color code',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const colorDecimal = parseInt(color, 16);

            const embed = new EmbedBuilder()
                .setDescription(message)
                .setColor(colorDecimal);

            await targetChannel.send({ embeds: [embed] });

            await interaction.reply({
                content: `message sent to ${targetChannel.name}!`,
                flags: MessageFlags.Ephemeral,
            });
        }
        catch (error) {
            console.error('error sending message:', error);
            await interaction.reply({
                content: 'error sending message',
                flags: MessageFlags.Ephemeral,
            });
        }

    },
};