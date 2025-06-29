const { EmbedBuilder, MessageFlags, SlashCommandBuilder } = require('discord.js');
const {Roles, RoleGroups} = require('../../../models.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listrolegroups')
		.setDescription('list all role groups'),

	async execute(interaction) {
		const roleGroups = await RoleGroups.findAll({
			where: {
				guildId: interaction.guild.id,
			}
		})

		roleStatus = {}
		await roleGroups.forEach(async (roleGroup) => {
			const roles = await Roles.findAll({
				where: {
					guildId: interaction.guild.id,
					roleGroupId: roleGroup.id,
				}
			})

			if (!roleStatus[roleGroup.name]) {
        		roleStatus[roleGroup.name] = [];
    		}
    
    		roles.forEach(role => {
        		roleStatus[roleGroup.name].push(role.roleId);
    		});
		})

		await interaction.reply({
			content: 'check console logs for list', // this will be changed later its temporary
			flags: MessageFlags.Ephemeral,
		})

		console.log(roleStatus);

	}


}
