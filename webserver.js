const express = require('express');

function createServer(client) {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get('/', (req, res) => {
        const isOnline = true; 
        const barColor = isOnline ? '#4CAF50' : '#FF6F6F'; // darker green or red
        const statusText = isOnline ? 'Online' : 'Offline';
        res.send(`
            <html>
                <head>
                    <title>Bot Status</title>
                    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <img src="/assets/snoopy.gif" alt="Snoopy" class="snoopy-img" />
                        <div class="status-bar">${statusText}</div>
                    </div>
                </body>
            </html>
        `);
    });

    app.use('/assets', express.static('assets'));

    const server = app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    return { app, server };
}

module.exports = { createServer };