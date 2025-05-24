const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { StravaUsers } = require('../../models.js');

// distance categories for different views
const DISTANCE_VIEWS = {
    sprint: {
        name: '⚡ Sprint Distances',
        distances: {
            '400m': 400,
            '1/2 Mile': 804.67,
            '1K': 1000
        }
    },
    middle: {
        name: '🏃‍♂️ Middle Distances', 
        distances: {
            '1 Mile': 1609.34,
            '2 Mile': 3218.68,
            '5K': 5000
        }
    },
    distance: {
        name: '🏔️ Distance Running',
        distances: {
            '10K': 10000,
            'Half Marathon': 21097.5,
            'Marathon': 42195
        }
    },
    all: {
        name: '📊 All Distances',
        distances: {
            '400m': 400,
            '1/2 Mile': 804.67,
            '1K': 1000,
            '1 Mile': 1609.34,
            '2 Mile': 3218.68,
            '5K': 5000,
            '10K': 10000,
            'Half Marathon': 21097.5,
            'Marathon': 42195
        }
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-leaderboard')
        .setDescription('View interactive leaderboard for different race distances'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // check if users are connected
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

            // start with middle distances (most common) - keeping this as default
            const { embed, row } = await createLeaderboardView('middle', stravaUsers, interaction.guild);
            await interaction.editReply({ embeds: [embed], components: [row] });

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

// create leaderboard view for specific distance category
async function createLeaderboardView(viewType, stravaUsers, guild) {
    const view = DISTANCE_VIEWS[viewType];
    const leaderboards = {};
    
    // initialize leaderboards
    for (const distanceName of Object.keys(view.distances)) {
        leaderboards[distanceName] = [];
    }

    console.log(`Processing ${view.name} for ${stravaUsers.length} users...`);

    // process each user
    for (const stravaUser of stravaUsers) {
        try {
            const userResults = await getUserEstimatedBestEfforts(stravaUser, view.distances, guild);
            
            // add user results to respective leaderboards
            for (const [distanceName, result] of Object.entries(userResults)) {
                if (result) {
                    leaderboards[distanceName].push(result);
                }
            }
        } catch (error) {
            console.error(`Error processing user ${stravaUser.discord_user_id}:`, error);
        }
    }

    // sort leaderboards by time (fastest first)
    for (const distanceName of Object.keys(leaderboards)) {
        leaderboards[distanceName].sort((a, b) => a.time - b.time);
        leaderboards[distanceName] = leaderboards[distanceName].slice(0, 10); // top 10
    }

    // create embed
    const embed = createLeaderboardEmbed(leaderboards, view.name, viewType);
    
    // create button row with all 4 views
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('leaderboard_sprint')
                .setLabel('Sprint')
                .setEmoji('⚡')
                .setStyle(viewType === 'sprint' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('leaderboard_middle')
                .setLabel('Middle')
                .setEmoji('🏃‍♂️')
                .setStyle(viewType === 'middle' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('leaderboard_distance')
                .setLabel('Distance')
                .setEmoji('🏔️')
                .setStyle(viewType === 'distance' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('leaderboard_all')
                .setLabel('All')
                .setEmoji('📊')
                .setStyle(viewType === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );

    return { embed, row };
}

// create the leaderboard embed
function createLeaderboardEmbed(leaderboards, viewName, viewType) {
    const embed = new EmbedBuilder()
        .setColor('#FC4C02')
        .setTitle('🏆 Strava Running Leaderboard')
        .setDescription(`**${viewName}**\n*Click buttons below to switch categories*`)
        .setTimestamp();

    // for "all" view, show fewer entries per distance to fit everything
    const maxEntries = viewType === 'all' ? 3 : 5;

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
        for (let i = 0; i < Math.min(results.length, maxEntries); i++) {
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
        text: '📊 Based on best efforts from connected users • Click times to view on Strava' 
    });

    return embed;
}

// button interaction handler (add this to your main index.js)
async function handleLeaderboardButton(interaction) {
    if (!interaction.customId.startsWith('leaderboard_')) return false;

    try {
        await interaction.deferUpdate();

        const viewType = interaction.customId.replace('leaderboard_', '');
        
        // get connected users
        const stravaUsers = await StravaUsers.findAll({
            where: { guild_id: interaction.guild.id }
        });

        if (stravaUsers.length === 0) {
            return interaction.followUp({ 
                content: '❌ No connected users found!', 
                ephemeral: true 
            });
        }

        // create new view
        const { embed, row } = await createLeaderboardView(viewType, stravaUsers, interaction.guild);
        await interaction.editReply({ embeds: [embed], components: [row] });

        return true;
    } catch (error) {
        console.error('Error handling leaderboard button:', error);
        return false;
    }
}

// ... rest of your existing functions (getUserEstimatedBestEfforts, formatTime) stay the same ...

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

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// export the button handler for use in index.js
module.exports.handleLeaderboardButton = handleLeaderboardButton;