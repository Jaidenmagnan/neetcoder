// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, Partials, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// start strava server
require('./strava-server.js');

// Import the setDiscordClient function
const { setDiscordClient } = require('./strava-server.js');

const { handleLeaderboardButton } = require('./commands/utility/strava-leaderboard.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
});

function loadCommands() {
    client.commands = new Collection();

    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                delete require.cache[require.resolve(filePath)];
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

// message listener for reloading

function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

loadCommands();
loadEvents();

client.once(Events.ClientReady, readyClient => {
    // set discord cli for strava serv
    setDiscordClient(readyClient);
    
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('❌ GLOBAL COMMAND ERROR:', error);
            
            // let the command handle its own errors - don't send duplicate messages
            if (error.code === 10062) {
                console.log('⚠️ Interaction expired at global level');
                return;
            }
            
            // only send global error if the command hasn't already handled it
            console.log('⚠️ Unhandled command error - command should handle this itself');
        }
    }

    if (interaction.isButton()) {
        try {
            if (await handleLeaderboardButton(interaction)) {
                return;
            }
        } catch (error) {
            console.error('❌ Button error:', error);
            if (error.code !== 10062) {
                try {
                    if (!interaction.replied) {
                        await interaction.reply({ content: 'Button interaction failed!', ephemeral: true });
                    }
                } catch (followUpError) {
                    console.log('Could not send button error message');
                }
            }
        }
    }
});

module.exports = { loadCommands, loadEvents };

// Log in to Discord with your client's token
client.login(process.env.TOKEN);