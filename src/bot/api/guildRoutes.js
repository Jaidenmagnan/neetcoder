const { UserAuth, Guilds, Users } = require('../../models.js');
const axios = require('axios');

function guildRoutes(app, client) {
    app.get('/api/list-guilds', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await UserAuth.findOne({
            where: { discordId: req.user.discordId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        try {
            const guildsResponse = await axios.get(
                `https://discord.com/api/users/@me/guilds`,
                {
                    headers: {
                        authorization: `${req.token_type} ${req.access_token}`,
                    },
                }
            );
            const allGuilds = guildsResponse.data;
            const botGuilds = await Guilds.findAll();
            const botGuildIds = botGuilds.map((g) => g.guildid);

            const filteredGuilds = allGuilds.filter((guild) =>
                botGuildIds.includes(guild.id)
            );

            res.json(filteredGuilds);
            console.log(filteredGuilds);
        } catch (error) {
            console.error('Error fetching guilds:', error);
            res.status(500).json({ error: 'Failed to fetch guilds' });
        }
    });

    app.get('/api/leaderboard', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const guildId = req.query.guildId;
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' });
        }

        try {
            const leaderboard = await Users.findAll({
                where: { guildid: guildId },
                order: [['message_count', 'DESC']],
                limit: 50,
            });

            // Fetch the guild from the Discord client
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                return res
                    .status(404)
                    .json({ error: 'Guild not found in bot cache' });
            }

            // Get user profiles from the guild's member cache
            const leaderboardWithProfiles = await Promise.all(
                leaderboard.map(async (user) => {
                    let member = guild.members.cache.get(user.userid);
                    // If not cached, try to fetch from Discord
                    if (!member) {
                        try {
                            member = await guild.members.fetch(user.userid);
                        } catch {
                            member = null;
                        }
                    }
                    return {
                        ...user.toJSON(),
                        profile: member
                            ? {
                                  discordId: member.user.id,
                                  userName:
                                      member.user.nickname ||
                                      member.user.username,
                                  avatar: member.user.displayAvatarURL(),
                              }
                            : {
                                  discordId: user.userid,
                                  userName: null,
                                  avatar: null,
                              },
                    };
                })
            );

            res.json(leaderboardWithProfiles);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = { guildRoutes };
