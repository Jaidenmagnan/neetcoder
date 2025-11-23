import * as fs from 'node:fs';
import * as path from 'node:path';
import { type ApplicationCommand, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const environment = process.env.NODE_ENV;
const guildId = process.env.GUILD_ID;

if (!token || !guildId || !environment || !clientId) {
	throw new Error('missing env variables');
}

const commands: string[] = [];
const foldersPath: string = path.join(__dirname, 'commands');
const commandFolders: string[] = fs.readdirSync(foldersPath);

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
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		const data: Array<ApplicationCommand> = (await rest.put(
			environment === 'development'
				? Routes.applicationGuildCommands(clientId, guildId)
				: Routes.applicationCommands(clientId),
			{ body: commands },
		)) as Array<ApplicationCommand>;

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	} catch (error) {
		console.error(error);
	}
})();
