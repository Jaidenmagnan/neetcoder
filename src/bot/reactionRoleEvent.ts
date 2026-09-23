import type {
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	User,
} from 'discord.js';
import { reactionRoleService } from '../di/container';
import { normalizeReactionEmoji } from '../services/reactionRoleEmoji';

/** Resolves partial Discord payloads and dispatches a reaction-role event. */
export async function handleReactionRoleEvent(
	action: 'add' | 'remove',
	reactionInput: MessageReaction | PartialMessageReaction,
	userInput: User | PartialUser,
): Promise<void> {
	try {
		const reaction = reactionInput.partial
			? await reactionInput.fetch()
			: reactionInput;
		const user = userInput.partial ? await userInput.fetch() : userInput;

		if (user.bot || !reaction.message.guildId) return;

		const emojiKey = normalizeReactionEmoji(
			reaction.emoji.id,
			reaction.emoji.name,
		);
		if (!emojiKey) return;

		const input = {
			discordGuildId: reaction.message.guildId,
			discordMessageId: reaction.message.id,
			memberId: user.id,
			emojiKey,
		};

		if (action === 'add') {
			await reactionRoleService.handleReactionAdded(input);
		} else {
			await reactionRoleService.handleReactionRemoved(input);
		}
	} catch (error) {
		console.error('Reaction-role event failed.', {
			action,
			messageId: reactionInput.message.id,
			userId: userInput.id,
			error,
		});
	}
}
