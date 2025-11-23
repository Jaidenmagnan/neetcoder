const { UserAuth, Guilds, Users } = require('../../models.js');
const { sign } = require('jsonwebtoken');
const axios = require('axios');

function authRoutes(app) {
    app.get('/api/user/me', (req, res) => {
        res.json(req.user);
    });

    app.get('/auth/sign-out', (req, res) => {
        res.clearCookie('token');
        res.redirect(process.env.CLIENT_REDIRECT_URL);
    });

    app.get('/auth/sign-in', async ({ query }, response) => {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        console.log('SIGNING IN');

        const { code } = query;

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
                );

                const oauthData = tokenRes.data;
                console.log(oauthData);

                const userRes = await axios.get(
                    'https://discord.com/api/users/@me',
                    {
                        headers: {
                            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                        },
                    }
                );
                console.log(userRes.data);
                const { id, username, avatar } = userRes.data;

                let user = await UserAuth.findOne({ where: { discordId: id } });

                if (user) {
                    user.userName = username;
                    user.avatar = avatar;
                    await user.save();
                } else {
                    user = await UserAuth.create({
                        discordId: id,
                        userName: username,
                        avatar: avatar || '',
                    });
                }

                const token = sign(
                    {
                        sub: id,
                        token_type: oauthData.token_type,
                        access_token: oauthData.access_token,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h',
                    }
                );

                response.cookie('token', token);
                response.redirect(process.env.CLIENT_REDIRECT_URL);
            } catch (error) {
                console.error(error);
            }
        }
    });
}

module.exports = { authRoutes };
