import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { data } from '../bot/commands/recap';

describe('/recap command definition', () => {
	it('is guild-scoped and restricted to server managers', () => {
		const command = data.toJSON();

		assert.deepEqual(command.contexts, [InteractionContextType.Guild]);
		assert.equal(
			command.default_member_permissions,
			PermissionFlagsBits.ManageGuild.toString(),
		);
	});

	it('offers setup, preview, status, and disable actions', () => {
		assert.deepEqual(
			data.toJSON().options?.map((option) => option.name),
			['setup', 'preview', 'status', 'disable'],
		);
	});
});
