const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

            // token refresh logic
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

            // helper functions for formatting data
            const formatDistance = (distance) => {
                if (!distance || distance === null || isNaN(distance)) {
                    return 'No data';
                }
                const miles = (distance / 1000) * 0.621371; // convert meters to miles
                return `${miles.toFixed(1)} mi`;
            };

            const formatNumber = (number) => {
                return number || 0;
            };

            // updated time formatting with exact minutes:seconds
            const formatTime = (seconds) => {
                if (!seconds) return 'No data';
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                
                if (hours > 0) {
                    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                } else {
                    return `${minutes}:${secs.toString().padStart(2, '0')}`;
                }
            };

            const formatPace = (distance, time) => {
                if (!distance || !time || distance <= 0 || time <= 0) return null;
                const miles = (distance / 1000) * 0.621371; // convert to miles
                const paceSeconds = time / miles; // seconds per mile
                const minutes = Math.floor(paceSeconds / 60);
                const seconds = Math.round(paceSeconds % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
            };

            // helper to format stats with optional pace and longest
            const formatStatsField = (totals, biggestDistance = null, showPace = false) => {
                let text = `**${formatNumber(totals.count)}** activities\n**${formatDistance(totals.distance)}**\n**${formatTime(totals.moving_time)}**`;
                
                // only add pace if there's actual data (distance > 0 and moving_time > 0)
                if (showPace && totals.distance > 0 && totals.moving_time > 0) {
                    const miles = (totals.distance / 1000) * 0.621371;
                    const paceSeconds = totals.moving_time / miles;
                    const minutes = Math.floor(paceSeconds / 60);
                    const seconds = Math.round(paceSeconds % 60);
                    text += `\n**Avg Pace:** ${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
                }
                
                // only add longest if there's actual data (biggestDistance > 0)
                if (biggestDistance && biggestDistance > 0 && !isNaN(biggestDistance)) {
                    const miles = (biggestDistance / 1000) * 0.621371;
                    text += `\n**Longest:** ${miles.toFixed(1)} mi`;
                }
                
                return text;
            };

            if (activityType) {
                // detailed view with interactive pagination
                const [statsResponse, activitiesResponse] = await Promise.all([
                    fetch(`https://www.strava.com/api/v3/athletes/${athleteData.id}/stats`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    }),
                    fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1`, {
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

                // function to create embed for a specific page
                const createEmbed = (page = 0, activitiesPerPage = 5) => {
                    const startIndex = page * activitiesPerPage;
                    const endIndex = startIndex + activitiesPerPage;
                    const pageActivities = filteredActivities.slice(startIndex, endIndex);
                    
                    const embed = new EmbedBuilder()
                        .setColor('#FC4C02')
                        .setTitle(`${isRunning ? '🏃‍♂️' : '🚴‍♂️'} ${athleteData.firstname} ${athleteData.lastname} - ${isRunning ? 'Running' : 'Cycling'} Stats`)
                        .setURL(`https://www.strava.com/athletes/${athleteData.id}`)
                        .setThumbnail(athleteData.profile || null)
                        .addFields(
                            { 
                                name: `📊 Recent (4 weeks)`, 
                                value: formatStatsField(recentTotals, null, true), // show pace but no longest for recent
                                inline: true 
                            },
                            { 
                                name: `🏆 All-Time`, 
                                value: formatStatsField(allTimeTotals, biggestDistance, false), // show longest but no pace for all-time
                                inline: true 
                            },
                            { 
                                name: `📈 This Year`, 
                                value: formatStatsField(isRunning ? stats.ytd_run_totals : stats.ytd_ride_totals, null, false), // basic stats only
                                inline: true 
                            }
                        );

                    if (pageActivities.length > 0) {
                        const recentActivitiesText = pageActivities.map(activity => {
                            const date = new Date(activity.start_date).toLocaleDateString();
                            const distance = formatDistance(activity.distance);
                            const time = formatTime(activity.moving_time);
                            const pace = formatPace(activity.distance, activity.moving_time);
                            
                            return `[**${activity.name}**](https://www.strava.com/activities/${activity.id})\n${date} • ${distance} • ${time}${pace ? ` • ${pace}` : ''}`;
                        }).join('\n\n');

                        const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
                        embed.addFields({
                            name: `🗓️ Recent ${isRunning ? 'Runs' : 'Rides'} (Page ${page + 1}/${totalPages}) - Click to view`,
                            value: recentActivitiesText,
                            inline: false
                        });
                    }

                    embed.setFooter({ text: `Athlete ID: ${athleteData.id}` })
                         .setTimestamp();
                    
                    return embed;
                };

                // function to create navigation buttons
                const createButtons = (page = 0, activitiesPerPage = 5) => {
                    const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
                    
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`strava_prev_${targetUser.id}_${activityType}_${page}_${activitiesPerPage}`)
                                .setLabel('Previous')
                                .setEmoji('⬅️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(page === 0),
                            new ButtonBuilder()
                                .setCustomId(`strava_next_${targetUser.id}_${activityType}_${page}_${activitiesPerPage}`)
                                .setLabel('Next')
                                .setEmoji('➡️')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(page >= totalPages - 1)
                        );
                    
                    return row;
                };

                const initialEmbed = createEmbed(0, 5);
                const initialButtons = createButtons(0, 5);

                await interaction.editReply({ 
                    embeds: [initialEmbed], 
                    components: [initialButtons] 
                });

            } else {
                // running and cycling overview
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
                    .setURL(`https://www.strava.com/athletes/${athleteData.id}`)
                    .setThumbnail(athleteData.profile || null)
                    .addFields(
                        { 
                            name: '🏃‍♂️ Recent Running (4 weeks)', 
                            value: formatStatsField(stats.recent_run_totals, null, false),
                            inline: true 
                        },
                        { 
                            name: '🚴‍♂️ Recent Cycling (4 weeks)', 
                            value: formatStatsField(stats.recent_ride_totals, null, false),
                            inline: true 
                        },
                        { name: '\u200B', value: '\u200B', inline: true }, 
                        { 
                            name: '🏃‍♂️ All-Time Running', 
                            value: formatStatsField(stats.all_run_totals, stats.biggest_run_distance, false),
                            inline: true 
                        },
                        { 
                            name: '🚴‍♂️ All-Time Cycling', 
                            value: formatStatsField(stats.all_ride_totals, stats.biggest_ride_distance, false),
                            inline: true 
                        },
                        { name: '\u200B', value: '\u200B', inline: true }
                    )
                    .setFooter({ text: `💡 Use "activity" parameter for detailed stats with interactive navigation • Athlete ID: ${athleteData.id}` })
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