const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ragebait')
        .setDescription('ragebaits a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ragebait')
                .setRequired(true)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('target');

        const ragebaits = [
            `${target.username} is **chronically online**.`,
            `${target.username} is **unemployed**.`,
            `${target.username} is a **Discord mod**.`,
            `${target.username} has never touched grass.`,
            `${target.username} argues in YouTube comments.`,
            `${target.username} gets ratioed on Twitter.`,
            `${target.username} has never seen sunlight.`,
        ];

        const ragebait = ragebaits[Math.floor(Math.random() * ragebaits.length)];

        const mention = `<@${target.id}>`;
        const embed = {
            description: `**${mention}\n\n${ragebait}**`,
            image: {
                url: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXZpYm15N2JvcHVyYXpyc2U5eTh6dnAyMDV3cXR2OWJsMXlhdDhyNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6UBFPWXTc3jUWZfRVi/giphy.gif',
            },
        };

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });

        await interaction.channel.send({
            embeds: [embed],
        });
    },
};