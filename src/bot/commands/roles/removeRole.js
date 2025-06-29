const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { Roles, RoleGroups } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroleremove')
        .setDescription('Remove a reaction role from a message.')
        .addStringOption(option =>
            option.setName('groupname')
                .setDescription('the name of the group you are removing from')
                .setRequired(true),
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role of which you are removing.')
                .setRequired(true),
        ),

    async execute(interaction) {
		const groupName = interaction.options.getRole('groupName');
        const roleId = interaction.options.getRole('role').id;

        try {
			const roleGroupId = await RoleGroups.findone({
				where: {
					name: groupName,
				}
			})

			if(!roleGroupId) {
				await interaction.reply({
					content: "role group not found!",
					flags: MessageFlags.Ephemeral,
				})
				return;
			}

            await Roles.destroy({
                where: {
                    guildid: interaction.guild.id,
					groupId: roleGroupId,
                    roleid: roleId,
                    emoji: emoji,
                },
            });
        }
        catch (error) {
            await interaction.reply({
                content: 'role could not be removed from group',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
