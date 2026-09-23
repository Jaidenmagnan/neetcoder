import type { NormalizedEmoji } from '../types/reactionRole';
import { ReactionRoleError } from './reactionRoleErrors';

const CUSTOM_EMOJI_PATTERN = /^<a?:[\w~]+:(\d+)>$/;
const EMOJI_PATTERN =
	/(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

/**
 * Normalizes an emoji supplied through a slash command.
 *
 * Custom emoji are keyed by their immutable Discord ID while Unicode emoji are
 * keyed by their complete grapheme sequence.
 */
export function normalizeEmojiInput(value: string): NormalizedEmoji {
	const emoji = value.trim();
	const customEmoji = emoji.match(CUSTOM_EMOJI_PATTERN);

	if (customEmoji) {
		return {
			key: `custom:${customEmoji[1]}`,
			display: emoji,
		};
	}

	const segments = [...new Intl.Segmenter().segment(emoji)];
	if (segments.length !== 1 || !EMOJI_PATTERN.test(emoji)) {
		throw new ReactionRoleError(
			'invalid-emoji',
			'Use one Unicode emoji or one custom Discord emoji.',
		);
	}

	return {
		key: `unicode:${emoji}`,
		display: emoji,
	};
}

/** Builds the same stable key from a Discord reaction event. */
export function normalizeReactionEmoji(
	id: string | null,
	name: string | null,
): string | undefined {
	if (id) {
		return `custom:${id}`;
	}

	return name ? `unicode:${name}` : undefined;
}
