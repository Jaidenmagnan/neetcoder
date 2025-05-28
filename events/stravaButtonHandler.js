const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { StravaUsers } = require('../models.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        // check if this is a strava navigation button
        if (!interaction.customId.startsWith('strava_')) return;

        try {
            const [, action, userId, activityType, currentPage, currentPerPage] = interaction.customId.split('_');
            const page = parseInt(currentPage);
            const perPage = parseInt(currentPerPage);

            // only handle prev and next now
            if (action !== 'prev' && action !== 'next') return;

            // get strava user data
            const stravaUser = await StravaUsers.findOne({
                where: {
                    discord_user_id: userId,
                    guild_id: interaction.guild.id
                }
            });

            if (!stravaUser) {
                return interaction.reply({ content: 'User not connected to Strava!', ephemeral: true });
            }

            await interaction.deferUpdate();

            let athleteData;
            if (typeof stravaUser.athlete_data === 'string') {
                athleteData = JSON.parse(stravaUser.athlete_data);
            } else {
                athleteData = stravaUser.athlete_data;
            }

            // get access token
            let accessToken = stravaUser.access_token;

            // fetch activities
            const activitiesResponse = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const activities = await activitiesResponse.json();
            const filteredActivities = activities.filter(activity => 
                activityType === 'running' ? activity.type === 'Run' : activity.type === 'Ride'
            );

            // helper functions (updated for miles)
            const formatDistance = (distance) => {
                if (!distance || distance === null || isNaN(distance)) return 'No data';
                const miles = (distance / 1000) * 0.621371;
                return `${miles.toFixed(1)} mi`;
            };

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
                if (!distance || !time) return 'No data';
                const miles = (distance / 1000) * 0.621371;
                const paceSeconds = time / miles;
                const minutes = Math.floor(paceSeconds / 60);
                const seconds = Math.round(paceSeconds % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
            };

            // determine new page
            let newPage = page;
            if (action === 'prev') {
                newPage = Math.max(0, page - 1);
            } else if (action === 'next') {
                newPage = page + 1;
            }

            // create updated embed
            const startIndex = newPage * perPage;
            const endIndex = startIndex + perPage;
            const pageActivities = filteredActivities.slice(startIndex, endIndex);
            const totalPages = Math.ceil(filteredActivities.length / perPage);

            const isRunning = activityType === 'running';

            // get the original embed data (we'll keep the stats the same)
            const originalEmbed = interaction.message.embeds[0];
            
            const embed = new EmbedBuilder()
                .setColor('#FC4C02')
                .setTitle(originalEmbed.title)
                .setURL(originalEmbed.url)
                .setThumbnail(originalEmbed.thumbnail?.url || null)
                .addFields(originalEmbed.fields.slice(0, 3)); // keep the first 3 stat fields

            if (pageActivities.length > 0) {
                const recentActivitiesText = pageActivities.map(activity => {
                    const date = new Date(activity.start_date).toLocaleDateString();
                    const distance = formatDistance(activity.distance);
                    const time = formatTime(activity.moving_time);
                    const pace = formatPace(activity.distance, activity.moving_time);
                    
                    return `[**${activity.name}**](https://www.strava.com/activities/${activity.id})\n${date} • ${distance} • ${time} • ${pace}`;
                }).join('\n\n');

                embed.addFields({
                    name: `🗓️ Recent ${isRunning ? 'Runs' : 'Rides'} (Page ${newPage + 1}/${totalPages}) - Click to view`,
                    value: recentActivitiesText,
                    inline: false
                });
            }

            embed.setFooter(originalEmbed.footer)
                 .setTimestamp();

            // create updated buttons (no more button)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`strava_prev_${userId}_${activityType}_${newPage}_${perPage}`)
                        .setLabel('Previous')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newPage === 0),
                    new ButtonBuilder()
                        .setCustomId(`strava_next_${userId}_${activityType}_${newPage}_${perPage}`)
                        .setLabel('Next')
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newPage >= totalPages - 1)
                );

            await interaction.editReply({ 
                embeds: [embed], 
                components: [row] 
            });

        } catch (error) {
            console.error('Error handling strava button:', error);
            await interaction.reply({ content: 'Something went wrong!', ephemeral: true });
        }
    },
}; 