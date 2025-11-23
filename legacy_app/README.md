# neetcoder
`neetcoder` is a feature-rich Discord bot built with Node.js and Discord.js v14. It offers a variety of fun and utility commands, an XP/leveling system, reaction roles, automated welcome messages, and more, all powered by a PostgreSQL database managed with Sequelize.

You can add the bot to your server [here](https://discord.com/api/oauth2/authorize?client_id=1375510601345794078&permissions=8&scope=bot%20applications.commands).

We have a permissions overhaul in progress to not add another administrator to your server.

## Features

*   **Slash Commands:** A wide array of interactive commands to enhance your server.
    *   **Fun Commands:**
        *   `/deathbattle`: Engage in a simulated text-based battle against another user.
        *   `/lolprofile <summoner_name> <tag>`: Fetch League of Legends player statistics and recent match performance.
        *   `/madlibs`: Generate hilarious and random Mad Libs stories.
        *   `/searchbook <title>`: Look up book information using the Google Books API.
        *   `/votetimeout <user> <numvotes> <minutes>`: Initiate a vote among server members to temporarily timeout a user.
        *   `/fnshop`: Fetch the current Fortnite shop.
    *   **Utility Commands:**
        *   `/init_welcome <channel>`: Configure a specific channel for welcome and goodbye messages.
        *   `/init_moderation <channel>`: Configure a specific channel for the moderation logs.
        *   `/leaderboard`: View the server's top users based on their "aura" (XP level).
        *   `/level`: Check your current aura level and message count.
        *   `/ping`: A simple command to check the bot's responsiveness.
        *   `/reactionroleadd <messageid> <emoji> <role>`: Add a reaction role to a message.
        *   `/reactionroleremove <messageid> <emoji> <role>`: Remove a reaction role from a message.
        *   `/send <message> <color> <channel>`: Send a custom embedded message as the bot.
        *   `/server`: Get information about the current Discord server.
        *   `/user`: Get information about your Discord account.
        *   `/summarize`: Uses a ChatGPT wrapper to summarize the previous messages in a channel.
*   **Automated Features & Events:**
    *   **Welcome & Goodbye Messages:** Automatically greets new members and announces departures in the designated welcome channel.
    *   **XP & Leveling System ("Aura"):** Users gain XP (aura) and level up by sending messages. Level-up notifications are sent in chat.
    *   **Reaction Roles:** Assigns or removes roles automatically when users add or remove reactions to configured messages.
    *   **Automatic Mad Libs:** Generates a Mad Libs story when `@everyone` is pinged or the bot is mentioned with the word "story".
    *   **Dynamic Reloading:** Admins can reload bot commands and events without a full restart using a specific chat command.
    *   **Twitter Link Fixer:** Automatically fixes messages that contain a link to x.com for improved content embedding.
    *   **Moderation Logs:** Logs role changes, message deletions, bans, kicks, etc.
*   **Database Integration:**
    *   Utilizes PostgreSQL with Sequelize ORM for persistent data storage, including:
        *   User levels and message counts.
        *   Server configurations (e.g., welcome channel ID, vote timeout parameters).
        *   Reaction role setups.
        *   Vote tracking for the `/votetimeout` command.

## Local Setup & Development

Follow these steps to set up and run the neetcoder bot locally for development or testing.

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (LTS version recommended)
    *   [Docker](https://www.docker.com/get-started) (Optional, for running PostgreSQL locally if you don't have an existing instance)

2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/jaidenmagnan/neetcoder.git
    cd neetcoder
    ```

3.  **Set Up Environment Variables:**
    *   Copy the `example.env` file to a new file named `.env`:
        ```bash
        cp example.env .env
        ```
    *   Open the `.env` file and fill in the required values. This includes:
        *   `TOKEN`: Your Discord Bot Token.
        *   `CLIENT_ID`: Your Discord Application's Client ID.
        *   `GUILD_ID`: The ID of your development/test Discord server (for deploying slash commands locally).
        *   `LOL_KEY`, `WAIFU_BASE_URL`: API keys/URLs for specific commands.
        *   Database credentials: `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`.
        *   PostgreSQL container credentials (if using Docker): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
        *   `NODE_ENV`: Set to `development` for local testing.
    *   Refer to the [Discord.js Guide: Creating Your Bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) for instructions on obtaining your `TOKEN` and `CLIENT_ID`.

4.  **Install Dependencies:**
    This project uses npm for package management.
    ```bash
    npm install
    ```

5.  **Set Up Local PostgreSQL Database (using Docker Compose):**
    If you wish to run PostgreSQL locally using Docker, ensure your `.env` file has the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` variables set. Then, run:
    ```bash
    docker-compose up -d
    ```
    This will start a PostgreSQL container. Your application will connect to this database using the `DB_*` variables from your `.env` file, which should match the `POSTGRES_*` variables for the container.

6.  **Deploy Slash Commands:**
    Before starting the bot, deploy the slash commands to your test guild. Ensure `NODE_ENV` is set to `development` in your `.env` file.
    ```bash
    npm run deploy-commands
    ```
    If `NODE_ENV` is `production`, commands will be deployed globally.

7.  **Run the Bot:**
    ```bash
    npm run dev
    ```
    Your bot should now be online and connected to your Discord server.
    
## Technology Stack

*   **Language:** JavaScript (Node.js)
*   **Framework:** [Discord.js](https://discord.js.org/) v14
*   **Database:** PostgreSQL
*   **ORM:** [Sequelize](https://sequelize.org/)
*   **Package Manager:** [npm](https://www.npmjs.com/)
*   **Linting:** ESLint
*   **Containerization (for DB):** Docker (optional, via `docker-compose.yml`)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Jaidenmagnan/neetcoder&type=Date)](https://www.star-history.com/#Jaidenmagnan/neetcoder&Date)

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
