import { Events, type Interaction } from 'discord.js';
import { LevelService } from '../../services/LevelService';

module.exports = {
	name: Events.MessageCreate,
	on: true,
	async execute(interaction: Interaction): Promise<void> {
		const levelService = new LevelService();
		await levelService.incrementLevel(
			interaction.user.id,
			interaction.guild?.id,
		);
	},
};
