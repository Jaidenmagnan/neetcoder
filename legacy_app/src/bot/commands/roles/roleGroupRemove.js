const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { RoleGroups, Roles } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerolegroup')
        .setDescription('deletes a role group')

        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('the name of the group to be deleted')
                .setRequired(true)
        ),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const roleGroup = await RoleGroups.findOne({
            where: {
                name: name,
                guildId: interaction.guild.id,
            },
        });

        const roleGroupId = roleGroup.id;

        const doesRoleGroupExist = !!roleGroup;
        if (!doesRoleGroupExist) {
            await interaction.reply({
                content: 'this role group does not exist',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await RoleGroups.destroy({
            where: {
                id: roleGroupId,
                guildId: interaction.guild.id,
            },
        });

        await Roles.destroy({
            where: {
                roleGroupId: roleGroupId,
                guildId: interaction.guild.id,
            },
        });

        await interaction.reply({
            content: 'the role group has been deleted!',
            flags: MessageFlags.Ephemeral,
        });
    },
};
