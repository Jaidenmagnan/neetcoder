const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { StravaUsers } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-stats')
        .setDescription('View Strava stats for a connected user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Select a user to view their Strava stats')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('activity')
                .setDescription('Get detailed stats for a specific activity type')
                .setRequired(false)
                .addChoices(
                    { name: '🏃‍♂️ Running', value: 'running' },
                    { name: '🚴‍♂️ Cycling', value: 'cycling' }
                )
        ),
    
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const activityType = interaction.options.getString('activity');
            
            const stravaUser = await StravaUsers.findOne({
                where: {
                    discord_user_id: targetUser.id,
                    guild_id: interaction.guild.id
                }
            });

            if (!stravaUser) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('❌ Not Connected')
                    .setDescription(
                        targetUser.id === interaction.user.id 
                            ? 'You haven\'t connected your Strava account yet! Use `/strava-connect` to get started.'
                            : `${targetUser.displayName} hasn't connected their Strava account yet.`
                    )
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            await interaction.deferReply();

            let athleteData;
            if (typeof stravaUser.athlete_data === 'string') {
                athleteData = JSON.parse(stravaUser.athlete_data);
            } else {
                athleteData = stravaUser.athlete_data;
            }

            const now = new Date();
            let accessToken = stravaUser.access_token;

            if (stravaUser.expires_at <= now) {
                try {
                    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            client_id: process.env.STRAVA_CLIENT_ID,
                            client_secret: process.env.STRAVA_CLIENT_SECRET,
                            refresh_token: stravaUser.refresh_token,
                            grant_type: 'refresh_token'
                        })
                    });

                    const tokenData = await refreshResponse.json();
                    
                    if (tokenData.access_token) {
                        accessToken = tokenData.access_token;
                        await stravaUser.update({
                            access_token: tokenData.access_token,
                            refresh_token: tokenData.refresh_token,
                            expires_at: new Date(tokenData.expires_at * 1000)
                        });
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }

            const formatDistance = (distance) => {
                if (!distance || distance === null || isNaN(distance)) {
                    return 'No data';
                }
                return `${(distance / 1000).toFixed(1)} km`;
            };

            const formatNumber = (number) => {
                return number || 0;
            };

            const formatTime = (seconds) => {
                if (!seconds) return 'No data';
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            };

            const formatPace = (distance, time) => {
                if (!distance || !time) return 'No data';
                const paceSeconds = time / (distance / 1000);
                const minutes = Math.floor(paceSeconds / 60);
                const seconds = Math.round(paceSeconds % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
            };

            if (activityType) {
                // detailed view
                const [statsResponse, activitiesResponse] = await Promise.all([
                    fetch(`https://www.strava.com/api/v3/athletes/${athleteData.id}/stats`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    }),
                    fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=10&page=1`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ]);

                if (!statsResponse.ok || !activitiesResponse.ok) {
                    throw new Error(`Strava API error`);
                }

                const stats = await statsResponse.json();
                const activities = await activitiesResponse.json();

                // filter activities
                const filteredActivities = activities.filter(activity => 
                    activityType === 'running' ? activity.type === 'Run' : activity.type === 'Ride'
                );

                const isRunning = activityType === 'running';
                const recentTotals = isRunning ? stats.recent_run_totals : stats.recent_ride_totals;
                const allTimeTotals = isRunning ? stats.all_run_totals : stats.all_ride_totals;
                const biggestDistance = isRunning ? stats.biggest_run_distance : stats.biggest_ride_distance;

                const embed = new EmbedBuilder()
                    .setColor('#FC4C02')
                    .setTitle(`${isRunning ? '🏃‍♂️' : '🚴‍♂️'} ${athleteData.firstname} ${athleteData.lastname} - ${isRunning ? 'Running' : 'Cycling'} Stats`)
                    .setThumbnail(athleteData.profile || null)
                    .addFields(
                        { 
                            name: `📊 Recent (4 weeks)`, 
                            value: `**${formatNumber(recentTotals.count)}** activities\n**${formatDistance(recentTotals.distance)}**\n**${formatTime(recentTotals.moving_time)}**\n**Avg Pace:** ${formatPace(recentTotals.distance, recentTotals.moving_time)}`, 
                            inline: true 
                        },
                        { 
                            name: `🏆 All-Time`, 
                            value: `**${formatNumber(allTimeTotals.count)}** total\n**${formatDistance(allTimeTotals.distance)}**\n**${formatTime(allTimeTotals.moving_time)}**\n**Longest:** ${formatDistance(biggestDistance)}`, 
                            inline: true 
                        },
                        { 
                            name: `📈 This Year`, 
                            value: `**${formatNumber(isRunning ? stats.ytd_run_totals.count : stats.ytd_ride_totals.count)}** activities\n**${formatDistance(isRunning ? stats.ytd_run_totals.distance : stats.ytd_ride_totals.distance)}**\n**${formatTime(isRunning ? stats.ytd_run_totals.moving_time : stats.ytd_ride_totals.moving_time)}**`, 
                            inline: true 
                        }
                    );

                // any recent activities, if any
                if (filteredActivities.length > 0) {
                    const recentActivitiesText = filteredActivities.slice(0, 5).map(activity => {
                        const date = new Date(activity.start_date).toLocaleDateString();
                        const distance = formatDistance(activity.distance);
                        const time = formatTime(activity.moving_time);
                        return `**${activity.name}**\n${date} • ${distance} • ${time}`;
                    }).join('\n\n');

                    embed.addFields({
                        name: `🗓️ Recent ${isRunning ? 'Runs' : 'Rides'} (Last 5)`,
                        value: recentActivitiesText,
                        inline: false
                    });
                }

                embed.setFooter({ text: `Athlete ID: ${athleteData.id}` })
                     .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else {
                // running and cycling overview
                // TODO: make a better general dashboard
                const statsResponse = await fetch(`https://www.strava.com/api/v3/athletes/${athleteData.id}/stats`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                if (!statsResponse.ok) {
                    throw new Error(`Strava API error: ${statsResponse.status}`);
                }

                const stats = await statsResponse.json();

                const embed = new EmbedBuilder()
                    .setColor('#FC4C02')
                    .setTitle(`🏃‍♂️ ${athleteData.firstname} ${athleteData.lastname}`)
                    .setDescription('**Strava Activity Overview**')
                    .setThumbnail(athleteData.profile || null)
                    .addFields(
                        { 
                            name: '🏃‍♂️ Recent Running (4 weeks)', 
                            value: `**${formatNumber(stats.recent_run_totals.count)}** activities\n**${formatDistance(stats.recent_run_totals.distance)}**\n**${formatTime(stats.recent_run_totals.moving_time)}**`, 
                            inline: true 
                        },
                        { 
                            name: '🚴‍♂️ Recent Cycling (4 weeks)', 
                            value: `**${formatNumber(stats.recent_ride_totals.count)}** activities\n**${formatDistance(stats.recent_ride_totals.distance)}**\n**${formatTime(stats.recent_ride_totals.moving_time)}**`, 
                            inline: true 
                        },
                        { name: '\u200B', value: '\u200B', inline: true }, 
                        { 
                            name: '🏃‍♂️ All-Time Running', 
                            value: `**${formatNumber(stats.all_run_totals.count)}** total runs\n**${formatDistance(stats.all_run_totals.distance)}**\n**${formatTime(stats.all_run_totals.moving_time)}**`, 
                            inline: true 
                        },
                        { 
                            name: '🚴‍♂️ All-Time Cycling', 
                            value: `**${formatNumber(stats.all_ride_totals.count)}** total rides\n**${formatDistance(stats.all_ride_totals.distance)}**\n**${formatTime(stats.all_ride_totals.moving_time)}**`, 
                            inline: true 
                        },
                        { name: '\u200B', value: '\u200B', inline: true },
                        {
                            name: '📊 Personal Bests', 
                            value: `**Longest Run:** ${formatDistance(stats.biggest_run_distance)}\n**Longest Ride:** ${formatDistance(stats.biggest_ride_distance)}`, 
                            inline: false 
                        }
                    )
                    .setFooter({ text: `💡 Use "activity" parameter for detailed stats • Athlete ID: ${athleteData.id}` })
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error in strava-stats command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Something went wrong retrieving the stats. Please try again.')
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
}; 