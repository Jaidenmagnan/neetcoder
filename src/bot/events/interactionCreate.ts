import { Events, type Interaction, MessageFlags } from 'discord.js';

module.exports = {
	name: Events.InteractionCreate,
	on: true,
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
			return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		if (interaction.isAutocomplete()) {
			if (!command.autocomplete) return;

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error('Autocomplete interaction failed.', error);
			}
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};
