// Require the necessary discord.js classes
const { Client, Collection, GatewayIntentBits, Partials, Options } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); const express = require('express'); // Add this at the top 

let isInitialized = false;

function createHealthCheckpoint() {
    const app = express();
    const PORT = process.env.BOT_HEALTH_PORT || 4000;

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.listen(PORT, () => {
        console.log(`Bot health-check running on port ${PORT}`);
    });

    return {app}
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
	sweepers: {
    	messages: {
      		interval: 1800, // 30 minutes
      		lifetime: 300,  // 5 minutes
     		},
	},
		makeCache: Options.cacheWithLimits({
        	MessageManager: 50,           // Reduce from default 200
        	UserManager: 100,             // Reduce from default Infinity
        	GuildMemberManager: 50,       // Reduce from default 200
        	ReactionManager: 10,          // Reduce from default 200
        	ReactionUserManager: 10,      // Reduce from default 200
        	ThreadManager: 25,            // Reduce from default 200
        	ThreadMemberManager: 10,      // Reduce from default 200
        	StageInstanceManager: 0,      // Disable if not using voice stages
        	GuildScheduledEventManager: 0, // Disable if not using events
        	// Keep these at Infinity if you need them
        	ChannelManager: Infinity,     
        	GuildManager: Infinity,
        	RoleManager: Infinity,
    }),
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

// message listener for reloading

function loadEvents() {
	client.removeAllListeners();
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
function initialize() {
	if ( !isInitialized ) {
		loadCommands();
		loadEvents();
		createHealthCheckpoint();
		client.login(process.env.TOKEN);
		isInitialized = true;
	}
}

if (require.main === module) {
	initialize();
}

module.exports = { loadCommands, loadEvents, client };



