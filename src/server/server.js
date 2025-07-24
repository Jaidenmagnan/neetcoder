const express = require('express')
const { UserAuth, Guilds, Users } = require('../models.js')
const { client } = require('../bot/index.js')
const axios = require('axios')
require('dotenv').config()
const path = require('path')
const { sign } = require('jsonwebtoken')
const cors = require('cors')
const authenticate = require('./middlewares/authenticate')
const cookieParser = require('cookie-parser')

async function isBotOnline() {
    const BOT_HEALTH_PORT = process.env.BOT_HEALTH_PORT || 4000
    const url = `http://localhost:${BOT_HEALTH_PORT}/health`

    try {
        const response = await axios.get(url, { timeout: 1000 })
        return response.status === 200
    } catch (error) {
        return false
    }
}

function createServer() {
    const app = express()
    const PORT = process.env.PORT || 3000

    app.use(
        cors({
            credentials: true,
        })
    )
    app.use(cookieParser())
    app.use(authenticate)

    const buildPath = path.join(__dirname, '../client/build')
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(buildPath))
    }

    app.get('/api/bot-status', async (_, res) => {
        const isOnline = await isBotOnline()
        const clientId = process.env.CLIENT_ID
        const discordLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
        res.json({
            isOnline,
            discordLink,
        })
    })

    app.get('/api/user/me', (req, res) => {
        res.json(req.user)
    })

    app.get('/auth/sign-out', (req, res) => {
        res.clearCookie('token')
        res.redirect(process.env.CLIENT_REDIRECT_URL)
    })

    app.get('/auth/sign-in', async ({ query }, response) => {
        const clientId = process.env.CLIENT_ID
        const clientSecret = process.env.CLIENT_SECRET
        const PORT = process.env.PORT

        const { code } = query

        if (code) {
            try {
                const tokenRes = await axios.post(
                    'https://discord.com/api/oauth2/token',
                    new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code,
                        grant_type: 'authorization_code',
                        redirect_uri: `${process.env.DISCORD_REDIRECT_URL}`,
                        scope: 'identify',
                    }).toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                const oauthData = tokenRes.data
                console.log(oauthData)

                const userRes = await axios.get(
                    'https://discord.com/api/users/@me',
                    {
                        headers: {
                            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                        },
                    }
                )
                console.log(userRes.data)
                const { id, username, avatar } = userRes.data

                let user = await UserAuth.findOne({ where: { discordId: id } })

                if (user) {
                    user.userName = username
                    user.avatar = avatar
                    await user.save()
                } else {
                    user = await UserAuth.create({
                        discordId: id,
                        userName: username,
                        avatar: avatar || '',
                    })
                }

                const token = await sign(
                    {
                        sub: id,
                        token_type: oauthData.token_type,
                        access_token: oauthData.access_token,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h',
                    }
                )

                response.cookie('token', token)
                response.redirect(process.env.CLIENT_REDIRECT_URL)
            } catch (error) {
                console.error(error)
            }
        }
    })

    app.get('/api/list-guilds', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const user = await UserAuth.findOne({
            where: { discordId: req.user.discordId },
        })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        try {
            const guildsResponse = await axios.get(
                `https://discord.com/api/users/@me/guilds`,
                {
                    headers: {
                        authorization: `${req.token_type} ${req.access_token}`,
                    },
                }
            )
            const allGuilds = guildsResponse.data
            const botGuilds = await Guilds.findAll()
            const botGuildIds = botGuilds.map((g) => g.guildid)

            const filteredGuilds = allGuilds.filter((guild) =>
                botGuildIds.includes(guild.id)
            )

            res.json(filteredGuilds)
            console.log(filteredGuilds)
        } catch (error) {
            console.error('Error fetching guilds:', error)
            res.status(500).json({ error: 'Failed to fetch guilds' })
        }
    })

    app.get('/api/leaderboard', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const guildId = req.query.guildId
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' })
        }

        try {
            const leaderboard = await Users.findAll({
                where: { guildid: guildId },
                order: [['message_count', 'DESC']],
                limit: 50,
            })

            // Fetch the guild from the Discord client
            const guild = client.guilds.cache.get(guildId)
            if (!guild) {
                return res
                    .status(404)
                    .json({ error: 'Guild not found in bot cache' })
            }

            // Get user profiles from the guild's member cache
            const leaderboardWithProfiles = await Promise.all(
                leaderboard.map(async (user) => {
                    let member = guild.members.cache.get(user.userid)
                    // If not cached, try to fetch from Discord
                    if (!member) {
                        try {
                            member = await guild.members.fetch(user.userid)
                        } catch {
                            member = null
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
                    }
                })
            )

            res.json(leaderboardWithProfiles)
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
            res.status(500).json({ error: 'Failed to fetch leaderboard' })
        }
    })

    if (process.env.NODE_ENV === 'production') {
        app.get('/{*any}', (_, res) => {
            res.sendFile(path.resolve(buildPath, 'index.html'))
        })
    }

    const server = app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`)
    })

    return { app, server }
}

const { app, server } = createServer()
