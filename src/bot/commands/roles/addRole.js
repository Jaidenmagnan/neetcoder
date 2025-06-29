const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { Roles, RoleGroups } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolegroupadd')
        .setDescription('Add a reaction role to a message.')

        .addStringOption(option =>
            option.setName('groupname')
                .setDescription('the name of the group in which you are adding the role to')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji for the role')
                .setRequired(true)

        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('the role of which you are adding.')
                .setRequired(true),
        ),



    async execute(interaction) {
        const groupName = interaction.options.getString('groupname');
        const roleId = interaction.options.getRole('role').id;
        const emoji = interaction.options.getString('emoji');

        try {
			const doesEmojiExist = !!client.emojis.cache.get(emoji);
			if (!doesEmojiExist) {
				await interaction.reply({
					content: "The emoji does not exist!",
					flags:MessageFlags.Ephemeral,
				})
			}

            let roleGroup = await RoleGroups.findOne({
                where: {
                    name: groupName,
                    guildId: interaction.guild.id,
                },
            });

            if (!roleGroup) {
                await interaction.reply({
                    content: 'group not found!',
                    flags: MessageFlags.Ephemeral,
                });
				return;
            }



			let _ = await Roles.create({
				roleGroupId: roleGroup.id,
				roleId: roleId,
				guildId: interaction.guild.id,
				emoji: emoji,
			})
			await interaction.reply({
				content: "role added to group: " + groupName,
				flags: MessageFlags.Ephemeral,
			})
        }
        catch (error) {
            await interaction.reply({
                content: 'issue adding to group',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}
