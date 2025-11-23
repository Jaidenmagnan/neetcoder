const { authRoutes } = require('./api/authRoutes.js');
const { guildRoutes } = require('./api/guildRoutes.js');

const authenticate = require('./middlewares/authenticate');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const express = require('express');

require('dotenv').config();

async function isBotOnline() {
    return true;
}

function createServer(client) {
    const app = express();

    const PORT = process.env.PORT || 3000;
    app.use(
        cors({
            credentials: true,
        })
    );
    app.use(cookieParser());
    app.use(authenticate);

    const buildPath = path.join(__dirname, '../client/build');
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(buildPath));
    }

    authRoutes(app);
    guildRoutes(app, client);

    app.get('/api/bot-status', async (_, res) => {
        const isOnline = await isBotOnline();
        const clientId = process.env.CLIENT_ID;
        const discordLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
        res.json({
            isOnline,
            discordLink,
        });
    });

    if (process.env.NODE_ENV === 'production') {
        app.get('/{*any}', (_, res) => {
            res.sendFile(path.resolve(buildPath, 'index.html'));
        });
    }

    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });

    return app;
}

module.exports = { createServer };
