import type {
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	User,
} from 'discord.js';
import { Events } from 'discord.js';
import { handleReactionRoleEvent } from '../reactionRoleEvent';

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(
		reaction: MessageReaction | PartialMessageReaction,
		user: User | PartialUser,
	) {
		await handleReactionRoleEvent('add', reaction, user);
	},
};
