const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');
const { Configurations } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('votetimeout')
        .setDescription('Votes to ban a user.')

        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('the user to vote ban')
                .setRequired(true)
        )

        .addIntegerOption((option) =>
            option
                .setName('numvotes')
                .setDescription('the number of votes needed to ban the user.')
                .setRequired(true)
        )

        .addNumberOption((option) =>
            option
                .setName('minutes')
                .setDescription(
                    'the amount of time the user will be timedout for in minutes.'
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const num_votes = interaction.options.getInteger('numvotes');
        const length = interaction.options.getNumber('minutes');

        // if statement determines whether the client user is above this user in the hierarchy, according to role position and guild ownership.
        if (!user.manageable) {
            await interaction.reply({
                content: `I don't have access to timeout ${user.displayName}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (num_votes == 0) {
            await interaction.reply({
                content: 'more than 0 votes please',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const yesButton = new ButtonBuilder()
            .setCustomId('vote_timeout_yes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success);

        const noButton = new ButtonBuilder()
            .setCustomId('vote_timeout_no')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(yesButton, noButton);

        const embed = new EmbedBuilder()
            .setTitle('IMPORTANT NOTICE!')
            .setDescription(
                `Should ${user.displayName} be banished into the low-level-thinker realm?`
            )
            .setColor('#FF6347')
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
            .addFields({
                name: 'Votes',
                value: `0/${num_votes}`,
                inline: true,
            });

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });

        const message = await interaction.fetchReply();

        await Configurations.create({
            messageid: message.id,
            guildid: interaction.guild.id,
            field: 'vote_timeout',
            votes_needed: num_votes,
            length_of_timeout: length,
            userid: user.id,
        });
    },
};
