// Require the necessary discord.js classes
const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
} = require('discord.js');
const fs = require('node:fs');
const { createServer } = require('./server.js');
const path = require('node:path');
require('dotenv').config();

let isInitialized = false;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

function loadCommands() {
    client.commands = new Collection();

    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command && 'execute' in command) {
                delete require.cache[require.resolve(filePath)];
                client.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
        }
    }
}

// message listener for reloading
function loadEvents() {
    client.removeAllListeners();
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter((file) => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

function initialize() {
    if (!isInitialized) {
        loadCommands();
        loadEvents();
        client.login(process.env.TOKEN);
        createServer(client);
        isInitialized = true;
    }
}

if (require.main === module) {
    initialize();
}

module.exports = { loadCommands, loadEvents, client };
