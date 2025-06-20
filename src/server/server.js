const express = require('express');
const http = require('http');
require('dotenv').config();
const path = require('path');


async function isBotOnline() {
    const BOT_HEALTH_PORT = process.env.BOT_HEALTH_PORT || 4000;
    const options = {
        hostname: 'localhost',
        port: BOT_HEALTH_PORT,
        path: '/health',
        method: 'GET',
        timeout: 1000,
    };

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

function createServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    const buildPath = path.join(__dirname, '../client/build');

    app.use(express.static(buildPath));

    app.get('/api/bot-status', async (_, res) => {
        const isOnline = await isBotOnline();
        const clientId = process.env.CLIENT_ID;
        const discordLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
        res.json({
            isOnline,
            discordLink
        });
    });

    app.get('/{*any}', (_, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
    });

    const server = app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    return { app, server };
}

const { app, server } = createServer();