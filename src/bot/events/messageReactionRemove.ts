import type {
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	User,
} from 'discord.js';
import { Events } from 'discord.js';
import { handleReactionRoleEvent } from '../reactionRoleEvent';

module.exports = {
	name: Events.MessageReactionRemove,
	async execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser,
	) {
		await handleReactionRoleEvent('remove', reaction, user);
	},
};
