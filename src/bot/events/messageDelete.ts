import type { Message, PartialMessage } from 'discord.js';
import { Events } from 'discord.js';
import { reactionRoleService } from '../../di/container';

module.exports = {
	name: Events.MessageDelete,
	async execute(message: Message | PartialMessage): Promise<void> {
		if (!message.guildId) return;

		try {
			await reactionRoleService.handleMessageDeleted(
				message.guildId,
				message.id,
			);
		} catch (error) {
			console.error('Failed to remove deleted reaction-role panel.', {
				guildId: message.guildId,
				messageId: message.id,
				error,
			});
		}
	},
};
