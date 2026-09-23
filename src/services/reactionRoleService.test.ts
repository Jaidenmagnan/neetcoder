import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { ReactionRoleDiscordGateway } from '../adapters/Discord/discordReactionRoleAdapter';
import type {
	ReactionRoleOption,
	ReactionRolePanelWithOptions,
} from '../types/reactionRole';
import {
	ReactionRoleService,
	type ReactionRoleStore,
} from './reactionRoleService';

describe('ReactionRoleService gateway events', () => {
	it('adds and removes a mapped role in normal mode', async () => {
		const calls: string[] = [];
		const config = createPanel('normal');
		const service = createService(config, calls);

		await service.handleReactionAdded(eventInput('unicode:✅'));
		await service.handleReactionRemoved(eventInput('unicode:✅'));

		assert.deepEqual(calls, ['add:role-1', 'remove:role-1']);
	});

	it('ignores reactions that have no configured mapping', async () => {
		const calls: string[] = [];
		const service = createService(createPanel('normal'), calls);

		await service.handleReactionAdded(eventInput('unicode:❌'));

		assert.deepEqual(calls, []);
	});

	it('removes competing roles and reactions before an exclusive assignment', async () => {
		const calls: string[] = [];
		const config = createPanel('exclusive', [
			createOption(1, 'role-1', 'unicode:✅', '✅'),
			createOption(2, 'role-2', 'unicode:🔵', '🔵'),
		]);
		const service = createService(config, calls);

		await service.handleReactionAdded(eventInput('unicode:🔵'));

		assert.deepEqual(calls, [
			'remove:role-1',
			'unreact:unicode:✅',
			'add:role-2',
		]);
	});

	it('serializes concurrent assignments for the same exclusive panel member', async () => {
		const calls: string[] = [];
		const config = createPanel('exclusive', [
			createOption(1, 'role-1', 'unicode:✅', '✅'),
			createOption(2, 'role-2', 'unicode:🔵', '🔵'),
		]);
		const service = createService(config, calls, 5);

		await Promise.all([
			service.handleReactionAdded(eventInput('unicode:✅')),
			service.handleReactionAdded(eventInput('unicode:🔵')),
		]);

		assert.deepEqual(calls, [
			'remove:role-2',
			'unreact:unicode:🔵',
			'add:role-1',
			'remove:role-1',
			'unreact:unicode:✅',
			'add:role-2',
		]);
	});
});

function createService(
	config: ReactionRolePanelWithOptions,
	calls: string[],
	delayMilliseconds = 0,
): ReactionRoleService {
	const store: ReactionRoleStore = {
		addOption: async () => config.options[0],
		createPanelWithOption: async () => config,
		deleteByGuildAndMessage: async () => false,
		deletePanel: async () => undefined,
		findAllByGuild: async () => [config.panel],
		findByGuildAndMessage: async () => config,
		findByGuildAndName: async () => config,
		removeOption: async () => undefined,
		updateMode: async () => undefined,
	};

	const gateway: ReactionRoleDiscordGateway = {
		validateConfiguration: async () => ({ key: 'unicode:✅', display: '✅' }),
		createPanelMessage: async () => 'message-1',
		deleteMessage: async () => undefined,
		addBotReaction: async () => undefined,
		removeBotReaction: async () => undefined,
		synchronizePanel: async () => [],
		validateAssignableRole: async () => undefined,
		addMemberRole: async (_guildId, _memberId, roleId) => {
			if (delayMilliseconds > 0) {
				await new Promise((resolve) => setTimeout(resolve, delayMilliseconds));
			}
			calls.push(`add:${roleId}`);
		},
		removeMemberRole: async (_guildId, _memberId, roleId) => {
			calls.push(`remove:${roleId}`);
		},
		removeMemberReaction: async (_panel, emojiKey) => {
			calls.push(`unreact:${emojiKey}`);
		},
	};

	return new ReactionRoleService(store, gateway);
}

function createPanel(
	mode: 'normal' | 'exclusive',
	options = [createOption(1, 'role-1', 'unicode:✅', '✅')],
): ReactionRolePanelWithOptions {
	return {
		panel: {
			id: 1,
			guildId: 1,
			channelId: 1,
			name: 'colors',
			discordMessageId: 'message-1',
			mode,
			isManagedMessage: true,
			title: 'Colors',
			description: null,
			discordGuildId: 'guild-1',
			discordChannelId: 'channel-1',
		},
		options,
	};
}

function createOption(
	id: number,
	discordRoleId: string,
	emojiKey: string,
	emojiDisplay: string,
): ReactionRoleOption {
	return { id, panelId: 1, discordRoleId, emojiKey, emojiDisplay };
}

function eventInput(emojiKey: string) {
	return {
		discordGuildId: 'guild-1',
		discordMessageId: 'message-1',
		memberId: 'member-1',
		emojiKey,
	};
}
