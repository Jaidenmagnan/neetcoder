// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { Player, QueryType } = require('discord-player');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
});

const player = new Player(client);

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
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                delete require.cache[require.resolve(filePath)];
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

// reload events for client
function loadEvents() {
    const clientPath = path.join(__dirname, 'events/client');
    const clientFiles = fs.readdirSync(clientPath).filter(file => file.endsWith('.js'));

    for (const file of clientFiles) {
        const filePath = path.join(clientPath, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }

    const playerPath = path.join(__dirname, 'events/player');
    const playerFiles = fs.readdirSync(playerPath).filter(file => file.endsWith('.js'));

    for (const file of playerFiles) {
        const filePath = path.join(playerPath, file);
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

// reload events for player

loadCommands();
loadEvents();

module.exports = { loadCommands, loadEvents };

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
