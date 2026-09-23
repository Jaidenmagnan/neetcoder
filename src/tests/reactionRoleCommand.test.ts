import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { InteractionContextType, PermissionFlagsBits } from 'discord.js';
import { data } from '../bot/commands/reactionRole';

describe('/reaction-role command definition', () => {
	it('is guild-scoped and restricted to role managers', () => {
		const command = data.toJSON();

		assert.deepEqual(command.contexts, [InteractionContextType.Guild]);
		assert.equal(
			command.default_member_permissions,
			PermissionFlagsBits.ManageRoles.toString(),
		);
	});

	it('publishes panel and option subcommand groups', () => {
		const command = data.toJSON();
		assert.deepEqual(
			command.options?.map((option) => option.name),
			['panel', 'option'],
		);
	});
});
