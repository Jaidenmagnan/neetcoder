import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Interaction, SlashCommandBuilder } from 'discord.js';
import { Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import { client, startClient } from './di/container';

dotenv.config();

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, Command>;
	}
}

interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: Interaction) => Promise<void>;
}

client.commands = new Collection<string, Command>();

function loadCommands(): void {
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
				client.commands.set(command.data.name, command);
			} else {
				console.warn(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
				);
			}
		}
	}
}

function loadEvents(): void {
	const eventsPath = path.join(__dirname, 'bot/events');
	const eventFiles = fs
		.readdirSync(eventsPath)
		.filter((file) => file.endsWith('.ts'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

loadCommands();
loadEvents();
startClient();
