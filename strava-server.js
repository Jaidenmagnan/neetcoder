const express = require('express');
const { StravaUsers } = require('./models.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const app = express();

let discordClient = null;

function setDiscordClient(client) {
    discordClient = client;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// oauth callback endpoint
app.get('/strava/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;

        // ? user defined access
        if (error) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2 style="color: #d32f2f;">❌ Authorization Denied</h2>
                        <p>You denied access to your Strava account.</p>
                        <p>You can close this window and try again in Discord.</p>
                    </body>
                </html>
            `);
        }

        if (!code || !state) {
            return res.status(400).send('Missing authorization code or state');
        }

        console.log('Received OAuth callback:', { code: code.substring(0, 10) + '...', state });

        const [discordUserId, guildId, channelId, messageId] = state.split(':');
        
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('Strava token error:', tokenData);
            throw new Error(tokenData.error);
        }

        console.log('Successfully got tokens for athlete:', tokenData.athlete.id);

        // stores into db
        await StravaUsers.upsert({
            discord_user_id: discordUserId,
            strava_athlete_id: tokenData.athlete.id.toString(),
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(tokenData.expires_at * 1000),
            athlete_data: tokenData.athlete,
            guild_id: guildId
        });

        console.log('Saved user data for Discord user:', discordUserId);

        // updated success message (after connecting)
        if (discordClient && channelId && messageId) {
            try {
                const channel = await discordClient.channels.fetch(channelId);
                const message = await channel.messages.fetch(messageId);
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#4CAF50')
                    .setTitle('✅ Successfully Connected!')
                    .setDescription(`Welcome, **${tokenData.athlete.firstname} ${tokenData.athlete.lastname}**!`)
                    .addFields(
                        { name: '🏃‍♂️ Connected Account', value: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`, inline: true },
                        { name: '🆔 Athlete ID', value: `${tokenData.athlete.id}`, inline: true },
                        { name: '📅 Connected', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                    )
                    .setThumbnail(tokenData.athlete.profile || null)
                    .setFooter({ text: 'You can now use Strava commands!' })
                    .setTimestamp();

                await message.edit({ embeds: [successEmbed] });
                console.log('Updated Discord message with success');
            } catch (err) {
                console.error('Failed to update Discord message:', err);
            }
        }

        // success! page
        res.send(`
            <html>
                <head>
                    <title>Strava Connected!</title>
                </head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div style="background: white; color: #333; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="color: #fc4c02; margin-bottom: 20px;">🎉 Successfully Connected!</h1>
                        <img src="https://d3nn82uaxijpm6.cloudfront.net/assets/website/strava_logo-90c3655df1de7e8b7afaadb8c4d30d8be9e40f7d.svg" alt="Strava" style="width: 200px; margin: 20px 0;">
                        <h2>Welcome, ${tokenData.athlete.firstname}!</h2>
                        <p style="font-size: 16px; margin: 20px 0;">Your Strava account has been successfully connected to Discord.</p>
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>✅ Connected Account:</strong> ${tokenData.athlete.firstname} ${tokenData.athlete.lastname}</p>
                            <p><strong>🏃‍♂️ Athlete ID:</strong> ${tokenData.athlete.id}</p>
                        </div>
                        <p style="color: #666; margin-top: 30px;">You can now close this window and return to Discord to use Strava commands!</p>
                    </div>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('OAuth callback error:', error);
        
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: #d32f2f;">❌ Connection Error</h2>
                    <p>Something went wrong while connecting your account.</p>
                    <p>Please try again in Discord.</p>
                    <p style="color: #666; font-size: 12px;">Error: ${error.message}</p>
                </body>
            </html>
        `);
    }
});

// check endpoint that its running
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Strava webhook server is running',
        timestamp: new Date().toISOString()
    });
});

// server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Strava webhook server running on port ${PORT}`);
    console.log(`📍 OAuth callback URL: http://localhost:${PORT}/strava/callback`);
});

module.exports = { app, setDiscordClient }; 