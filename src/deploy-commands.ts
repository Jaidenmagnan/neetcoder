import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
	ApplicationCommand,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const { CLIENT_ID, TOKEN, NODE_ENV, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
	throw new Error('Missing required environment variables: TOKEN, CLIENT_ID');
}

if (NODE_ENV === 'development' && !GUILD_ID) {
	throw new Error('GUILD_ID is required for development environment');
}

function loadCommands(): RESTPostAPIApplicationCommandsJSONBody[] {
	const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const foldersPath = path.join(__dirname, 'bot/commands');
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.ts'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);

			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.warn(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
				);
			}
		}
	}

	return commands;
}

async function deployCommands(): Promise<void> {
	const commands = loadCommands();

	if (!TOKEN) {
		throw new Error('missing TOKEN env variable');
	}

	const rest = new REST().setToken(TOKEN);

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		if (!CLIENT_ID || !GUILD_ID) {
			throw new Error('missing CLIENT_ID or GUILD_ID env variable');
		}

		const route =
			NODE_ENV === 'development'
				? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
				: Routes.applicationCommands(CLIENT_ID);

		const data = (await rest.put(route, {
			body: commands,
		})) as ApplicationCommand[];

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	} catch (error) {
		console.error('Failed to deploy commands:', error);
		process.exit(1);
	}
}

deployCommands();
