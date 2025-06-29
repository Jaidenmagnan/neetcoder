const { MessageFlags, EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { RoleGroups, Roles} = require('../../../models.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createreactionrolemessage')
		.setDescription('creates a message for reaction roles')

	.addStringOption(option =>
		option.setName('group')
		.setDescription('the name of the group to create a reaction message for')
		.setRequired(true)
	)
	
	.addStringOption(option => 
		option.setName('message')
		.setDescription('an optional message to put along with your reaction role message')
	 ),

	async execute(interaction) {
		const groupName = interaction.options.getString('group');
		const message = interaction.options.getString('message');

		const roleGroup = await RoleGroups.findOne({
			where: {
				name: groupName,
				guildId: interaction.guild.id,
			}
		})

		if (!roleGroup) {
			await interaction.message.reply({
				content: "role group not found",
				flags: MessageFlags.Ephemeral,
			})
			return;
		}

		const roles = await Roles.findAll({
			where: {
				roleGroupId: roleGroup.id,
				guildId: interaction.guild.id,
			}
		})

    	const embed = new EmbedBuilder()
        	.setColor('#B3D9FF')
        	.setTitle(`${groupName}`);
    
    	if (message) {
        	embed.setDescription(message);
    	}
    
    	let rolesText = '';
    	for (const role of roles) {
        	const discordRole = await interaction.guild.roles.fetch(role.roleId);

            if (discordRole) {
                let emoji = role.emoji;

				if (emoji && !emoji.includes(':') && /^\d+$/.test(emoji)) {
                    emoji = `<:custom:${emoji}>`;
                }

                rolesText += `${emoji} - ${discordRole.name}\n`;
            }
        }
    
    	if (rolesText) {
        	embed.addFields({
				name: 'Roles:',
            	value: rolesText,
            	inline: false
        	});
    	}
    	const sentEmbed = await interaction.channel.send({ 
			embeds: [embed],
			fetchReply: true,
		});

		await RoleGroups.update({ messageId: sentEmbed.id},
    		{ where: { id: roleGroup.id } }
		);

		for (const role of roles) {
			sentEmbed.react(role.emoji);
		}

		await interaction.reply({
			content: "reaction roles setup!",
			flags: MessageFlags.Ephemeral,
		})


	}
}
