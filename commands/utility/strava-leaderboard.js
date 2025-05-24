const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { StravaUsers } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-leaderboard')
        .setDescription('View leaderboard for different race distances'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // get all connected users in this guild
            const stravaUsers = await StravaUsers.findAll({
                where: { guild_id: interaction.guild.id }
            });

            if (stravaUsers.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('❌ No Connected Users')
                    .setDescription('No users have connected their Strava accounts yet!')
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // target distances for personal bests (in meters)
            const targetDistances = {
                '1 Mile': 1609.34,
                '2 Mile': 3218.68,  
                '5K': 5000,
                '10K': 10000
            };

            const leaderboards = {};
            for (const distanceName of Object.keys(targetDistances)) {
                leaderboards[distanceName] = [];
            }

            console.log(`Processing leaderboard for ${stravaUsers.length} users...`);

            // process each user
            for (const stravaUser of stravaUsers) {
                try {
                    const userResults = await getUserEstimatedBestEfforts(stravaUser, targetDistances, interaction.guild);
                    
                    // add user results to respective leaderboards
                    for (const [distanceName, result] of Object.entries(userResults)) {
                        if (result) {
                            leaderboards[distanceName].push(result);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing user ${stravaUser.discord_user_id}:`, error);
                    // continue processing other users
                }
            }

            // sort leaderboards by time (fastest first)
            for (const distanceName of Object.keys(leaderboards)) {
                leaderboards[distanceName].sort((a, b) => a.time - b.time);
                leaderboards[distanceName] = leaderboards[distanceName].slice(0, 10); // top 10
            }

            // create embed with original formatting restored
            const embed = await createLeaderboardEmbed(leaderboards, interaction.guild);
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in strava-leaderboard command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Something went wrong retrieving the leaderboard.')
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};

// function to estimate user's best efforts for target distances
async function getUserEstimatedBestEfforts(stravaUser, targetDistances, guild) {
    try {
        // get discord user info for display name
        let discordUser;
        try {
            discordUser = await guild.members.fetch(stravaUser.discord_user_id);
        } catch (error) {
            console.error(`Could not fetch Discord user ${stravaUser.discord_user_id}`);
            return {};
        }

        // get athlete data
        let athleteData;
        if (typeof stravaUser.athlete_data === 'string') {
            athleteData = JSON.parse(stravaUser.athlete_data);
        } else {
            athleteData = stravaUser.athlete_data;
        }

        // refresh token if needed
        let accessToken = stravaUser.access_token;
        const now = new Date();

        if (stravaUser.expires_at <= now) {
            const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        }

        // fetch user's activities (comprehensive search)
        let allRuns = [];
        let page = 1;
        const maxPages = 5; // get up to 1000 activities

        while (page <= maxPages) {
            const activitiesResponse = await fetch(
                `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
                {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                }
            );

            if (!activitiesResponse.ok) {
                console.error(`Failed to fetch activities for user ${athleteData.firstname}`);
                break;
            }

            const activities = await activitiesResponse.json();
            
            // filter for runs only
            const runs = activities.filter(activity => 
                activity.type === 'Run' && 
                activity.distance > 0 && 
                activity.moving_time > 0
            );

            allRuns = allRuns.concat(runs);

            if (activities.length < 200) break;
            page++;
        }

        console.log(`Found ${allRuns.length} total runs for ${discordUser.displayName || discordUser.user.username}`);

        // estimate best efforts for each target distance
        const estimatedBestEfforts = {};
        
        for (const [distanceName, targetMeters] of Object.entries(targetDistances)) {
            let bestEffort = null;
            
            // strategy: find the best estimated time from all runs
            for (const run of allRuns) {
                // calculate average pace for this run (seconds per meter)
                const pacePerMeter = run.moving_time / run.distance;
                
                // estimate what the time would be for our target distance at this pace
                const estimatedTime = pacePerMeter * targetMeters;
                
                // only consider this if:
                // 1. the run is at least as long as our target distance (can't extrapolate upward reliably)
                // 2. it's the best time we've seen so far
                if (run.distance >= targetMeters && 
                    (!bestEffort || estimatedTime < bestEffort.estimatedTime)) {
                    
                    bestEffort = {
                        estimatedTime: estimatedTime,
                        sourceActivity: run,
                        sourcePace: pacePerMeter,
                        discordUser: discordUser,
                        user: stravaUser
                    };
                }
            }
            
            // also check if we have any runs close to the target distance for direct comparison
            const closeRuns = allRuns.filter(run => {
                const distanceDiff = Math.abs(run.distance - targetMeters);
                const tolerance = targetMeters * 0.1; // 10% tolerance
                return distanceDiff <= tolerance;
            });
            
            if (closeRuns.length > 0) {
                const fastestCloseRun = closeRuns.reduce((fastest, current) => 
                    current.moving_time < fastest.moving_time ? current : fastest
                );
                
                // if we found a close run that's faster than our estimated time, use it
                if (!bestEffort || fastestCloseRun.moving_time < bestEffort.estimatedTime) {
                    bestEffort = {
                        estimatedTime: fastestCloseRun.moving_time,
                        sourceActivity: fastestCloseRun,
                        sourcePace: fastestCloseRun.moving_time / fastestCloseRun.distance,
                        discordUser: discordUser,
                        user: stravaUser,
                        isActualDistance: true
                    };
                }
            }
            
            if (bestEffort) {
                estimatedBestEfforts[distanceName] = {
                    time: Math.round(bestEffort.estimatedTime),
                    activityId: bestEffort.sourceActivity.id,
                    discordUser: discordUser,
                    distance: targetMeters,
                    user: stravaUser,
                    isEstimated: !bestEffort.isActualDistance
                };

                const estimatedText = bestEffort.isActualDistance ? "(actual)" : "(estimated)";
                console.log(`${discordUser.displayName}: ${distanceName} best effort = ${formatTime(Math.round(bestEffort.estimatedTime))} ${estimatedText}`);
            } else {
                console.log(`${discordUser.displayName}: No suitable runs found for ${distanceName} estimation`);
            }
        }

        return estimatedBestEfforts;

    } catch (error) {
        console.error('Error getting user estimated best efforts:', error);
        return {};
    }
}

// function to create the leaderboard embed (restored original formatting)
async function createLeaderboardEmbed(leaderboards, guild) {
    const embed = new EmbedBuilder()
        .setColor('#FC4C02')
        .setTitle('🏆 Strava Running Leaderboard')
        .setDescription('**Best times by distance**')
        .setTimestamp();

    for (const [distanceName, results] of Object.entries(leaderboards)) {
        if (results.length === 0) {
            embed.addFields({
                name: `🏃‍♂️ ${distanceName}`,
                value: '*No times recorded*',
                inline: true
            });
            continue;
        }

        let leaderboardText = '';
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const position = i + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
            const username = result.discordUser.displayName || result.discordUser.user.username;
            const timeLink = `[${formatTime(result.time)}](https://www.strava.com/activities/${result.activityId})`;
            
            leaderboardText += `${medal} **${username}** ${timeLink}\n`;
        }

        embed.addFields({
            name: `🏃‍♂️ ${distanceName}`,
            value: leaderboardText,
            inline: true
        });
    }

    embed.setFooter({ 
        text: '📊 Based on best times from connected users • Click times to view on Strava' 
    });

    return embed;
}

// helper function to format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 