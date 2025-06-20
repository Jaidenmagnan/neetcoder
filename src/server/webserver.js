const express = require('express');
require('dotenv').config();


function createServer(client) {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get('/', (req, res) => {
        const isOnline = true; 
        const barColor = isOnline ? '#4CAF50' : '#FF6F6F'; // darker green or red
        const statusText = isOnline ? 'Online' : 'Offline';
        const clientId = process.env.CLIENT_ID;
        const discordLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
        res.send(`
            <html>
            <head>
                <title>Neetcoder</title>
                <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
                <link rel="icon" type="image/jpeg" href="../assets/icon.jpg">
                <style>
                body {
                    font-family: 'Comic Sans MS', 'Comic Sans', cursive, sans-serif;
                    background: #f5e6c8;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .snoopy-img {
                    width: 120px;
                    margin-bottom: 10px;
                    z-index: 2;
                    position: relative;
                }
                .status-bar {
                    width: 350px;
                    height: 60px;
                    background: ${barColor};
                    border-radius: 30px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-family: 'Luckiest Guy', cursive, sans-serif;
                    color: #fff;
                    border: 4px solid #e0c097;
                    margin-bottom: 30px;
                    margin-top: 0;
                    position: relative;
                }
                .add-btn-container {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 40px;
                    display: flex;
                    justify-content: center;
                    z-index: 10;
                }
                .add-btn {
                    background: #ffe082;
                    background: #9CAF88;
                    font-family: 'Luckiest Guy', cursive, sans-serif;
                    color: white;
                    font-size: 1.3rem;
                    border: 3px solid #e0c097;
                    border-radius: 25px;
                    padding: 16px 38px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                }
                .add-btn:hover {
                    background: #ffd54f;
                    background: #9CAF88;
                    background: #8A9C7A;
                    transform: translateY(-2px) scale(1.04);
                }
                </style>
            </head>
            <body>
                <div class="container">
                <img src="/assets/snoopy.gif" alt="Snoopy" class="snoopy-img" />
                <div class="status-bar">${statusText}</div>
                </div>
                <div class="add-btn-container">
                <a href="${discordLink}" target="_blank" rel="noopener noreferrer">
                    <button class="add-btn">Add to Server</button>
                </a>
                </div>
            </body>
            </html>
        `);
    });

    app.use('/assets', express.static('src/assets'));

    const server = app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    return { app, server };
}

module.exports = { createServer };