const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-connect')
        .setDescription('Connect your Strava account'),
    
    async execute(interaction) {
        try {
            const { StravaUsers } = require('../../models.js');
            
            const existingUser = await StravaUsers.findOne({
                where: {
                    discord_user_id: interaction.user.id,
                    guild_id: interaction.guild.id
                }
            });

            if (existingUser) {
                let athleteData;
                if (typeof existingUser.athlete_data === 'string') {
                    athleteData = JSON.parse(existingUser.athlete_data);
                } else {
                    athleteData = existingUser.athlete_data;
                }

                const embed = new EmbedBuilder()
                    .setColor('#FC4C02')
                    .setTitle('🔗 Already Connected!')
                    .setDescription(`Your Strava account is already connected!`)
                    .addFields({
                        name: '🏃‍♂️ Connected as', 
                        value: `${athleteData.firstname} ${athleteData.lastname}`, 
                        inline: true 
                    })
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // first endpoint, reply to get message
            const embed = new EmbedBuilder()
                .setColor('#FC4C02')
                .setTitle('🔗 Connect Your Strava Account')
                .setDescription('Click the link below to connect your Strava account!')
                .setFooter({ text: 'Generating authorization link...' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

            // getting the reply message
            const reply = await interaction.fetchReply();

            // message info for callback
            const state = `${interaction.user.id}:${interaction.guild.id}:${interaction.channel.id}:${reply.id}`;
            const scopes = 'read,activity:read_all';
            const redirectUri = `${BASE_URL}/strava/callback`;
            
            const authUrl = `https://www.strava.com/oauth/authorize?` +
                `client_id=${STRAVA_CLIENT_ID}&` +
                `response_type=code&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `approval_prompt=force&` +
                `scope=${scopes}&` +
                `state=${state}`;

            // updating message with auth link 
            const updatedEmbed = new EmbedBuilder()
                .setColor('#FC4C02')
                .setTitle('🔗 Connect Your Strava Account')
                .setDescription('Click the link below to connect your Strava account!')
                .addFields({
                    name: '🔗 Click here to connect:', 
                    value: `[Connect to Strava](${authUrl})`,
                    inline: false
                })
                .setFooter({ text: 'This will open Strava in your browser' })
                .setTimestamp();

            await interaction.editReply({ embeds: [updatedEmbed] });

        } catch (error) {
            console.error('Error in strava-connect command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Something went wrong. Please try again.')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

