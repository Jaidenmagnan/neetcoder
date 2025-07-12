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
            ` is **chronically online**.`,
            ` is **unemployed**.`,
            ` is a **Discord mod**.`,
            ` has never touched grass.`,
            ` argues in YouTube comments.`,
            ` gets ratioed on Twitter.`,
            ` has never seen sunlight.`,
        ];

        const ragebait = ragebaits[Math.floor(Math.random() * ragebaits.length)];

        const mention = `<@${target.id}>`;
        const embed = {
            description: `**${mention}${ragebait}**`,
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