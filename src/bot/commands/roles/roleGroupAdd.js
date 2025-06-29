const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const {RoleGroups} = require('../../../models.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createrolegroup')
		.setDescription('Creates a role group')
	
		.addStringOption(option =>
			option.setName('name')
			.setDescription('the name of the new group')
		),

	async execute(interaction) {
		const name = interaction.options.getString('name')

		const doesRoleGroupExist = !! await RoleGroups.findOne({
			where: {
				name: name,
				guildId: interaction.guild.id,
			}
		})

		if (doesRoleGroupExist) {
			await interaction.reply({
				content: "role group already exists",
				flags: MessageFlags.Ephemeral, 
			})
			return;
		}


		await RoleGroups.create({
			name: name,
			guildId: interaction.guild.id,
		})

		await interaction.reply({
			content: "added role group: " + name,
			flags: MessageFlags.Ephemeral,

		})
		
	}
}
