import { type Client, Events } from 'discord.js';
import { recapScheduler } from '../../di/container';

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client<true>) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		recapScheduler.start();
	},
};
