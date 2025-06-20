const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { ReactionRoles } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroleremove')
        .setDescription('Remove a reaction role from a message.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The message id for the role to be removed.')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji for the role')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role of which you are removing.')
                .setRequired(true),
        ),

    async execute(interaction) {
        const message_id = interaction.options.getString('messageid');
        const role_id = interaction.options.getRole('role').id;
        const emoji = interaction.options.getString('emoji');

        try {
            const message = await interaction.channel.messages.fetch(message_id);

            const reaction_role = await ReactionRoles.findOne({
                where: {
                    messageid: message_id,
                    guildid: interaction.guild.id,
                    roleid: role_id,
                    emoji: emoji,
                },
            });

            if (reaction_role) {
                await reaction_role.destroy();

                const reaction = message.reactions.cache.get(emoji) ||
                    message.reactions.cache.find(r => r.emoji.toString() === emoji);
                if (reaction) {
                    await reaction.users.remove(interaction.client.user);
                }

                await interaction.reply({
                    content: 'reaction role removed',
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                await interaction.reply({
                    content: 'no reaction role found',
                    flags: MessageFlags.Ephemeral,
                });
            }

        }
        catch (error) {
            if (error.code === 10014) {
                await interaction.reply({
                    content: 'emoji not found',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await interaction.reply({
                content: 'issue removing reaction role',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};