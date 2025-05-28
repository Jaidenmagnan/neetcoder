const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { StravaUsers } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-disconnect')
        .setDescription('Disconnect your Strava account from this Discord server'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // check if user has a connected account
            const existingUser = await StravaUsers.findOne({
                where: {
                    discord_user_id: interaction.user.id,
                    guild_id: interaction.guild.id
                }
            });

            if (!existingUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('❌ No Account Connected')
                    .setDescription('You don\'t have a Strava account connected to this server.')
                    .addFields({
                        name: '💡 Want to connect?',
                        value: 'Use `/strava-connect` to link your Strava account!',
                        inline: false
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // get athlete name for confirmation
            let athleteData;
            if (typeof existingUser.athlete_data === 'string') {
                athleteData = JSON.parse(existingUser.athlete_data);
            } else {
                athleteData = existingUser.athlete_data;
            }

            const athleteName = `${athleteData.firstname} ${athleteData.lastname}`.trim();

            // remove the user's Strava connection
            await existingUser.destroy();

            const embed = new EmbedBuilder()
                .setColor('#FC4C02')
                .setTitle('✅ Account Disconnected')
                .setDescription(`Successfully disconnected **${athleteName}** from this Discord server.`)
                .addFields(
                    {
                        name: '🚫 What this means:',
                        value: '• Your runs won\'t be posted automatically\n• You won\'t appear in leaderboards\n• Your Strava data is removed from our database',
                        inline: false
                    },
                    {
                        name: '🔄 Want to reconnect later?',
                        value: 'Just use `/strava-connect` anytime!',
                        inline: false
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            console.log(`${interaction.user.username} disconnected Strava account: ${athleteName}`);

        } catch (error) {
            console.error('Error in strava-disconnect command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Something went wrong while disconnecting your account.')
                .setTimestamp();

            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
}; 