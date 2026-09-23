import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
	normalizeEmojiInput,
	normalizeReactionEmoji,
} from './reactionRoleEmoji';
import { ReactionRoleError } from './reactionRoleErrors';

describe('reaction-role emoji normalization', () => {
	it('preserves a complete Unicode emoji grapheme', () => {
		assert.deepEqual(normalizeEmojiInput(' 👍🏽 '), {
			key: 'unicode:👍🏽',
			display: '👍🏽',
		});
	});

	it('keys static and animated custom emoji by immutable ID', () => {
		assert.deepEqual(normalizeEmojiInput('<:hello:123456789012345678>'), {
			key: 'custom:123456789012345678',
			display: '<:hello:123456789012345678>',
		});
		assert.equal(
			normalizeEmojiInput('<a:wave:123456789012345678>').key,
			'custom:123456789012345678',
		);
	});

	it('creates matching keys from reaction event payloads', () => {
		assert.equal(
			normalizeReactionEmoji('123456789012345678', 'renamed'),
			'custom:123456789012345678',
		);
		assert.equal(normalizeReactionEmoji(null, '✅'), 'unicode:✅');
	});

	it('rejects text and multiple emoji', () => {
		assert.throws(() => normalizeEmojiInput('hello'), ReactionRoleError);
		assert.throws(() => normalizeEmojiInput('✅❌'), ReactionRoleError);
	});
});
