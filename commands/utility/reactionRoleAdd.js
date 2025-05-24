const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { ReactionRoles } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroleadd')
        .setDescription('Add a reaction role to a message.')

        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('the message id for the role to be added.')
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji for the role')
                .setRequired(true)

        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('the role of which you are reacting to.')
                .setRequired(true),
        ),



    async execute(interaction) {
        const message_id = interaction.options.getString('messageid');
        const role_id = interaction.options.getRole('role').id;
        const emoji = interaction.options.getString('emoji');

        try {
            const message = await interaction.channel.messages.fetch(message_id);

            let reaction_role = await ReactionRoles.findOne({
                where: {
                    messageid: message_id,
                    guildid: interaction.guild.id,
                    roleid: role_id,
                    emoji: emoji,
                },
            });

            if (!reaction_role) {
                reaction_role = await ReactionRoles.create({ 
                    messageid: message_id,
                    guildid: interaction.guild.id,
                    roleid: role_id,
                    emoji: emoji,
                });

                await message.react(emoji);
                await interaction.reply({
                    content: 'reaction role added',
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                await interaction.reply({
                    content: 'reaction role already added',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
        catch (error) {
            if (error === 10014) {
                await interaction.reply({
                    content: 'emoji not found',
                    flags: MessageFlags.Ephemeral,
                });
            }
            else {
                await interaction.reply({
                    content: 'issues adding reactions',
                    flags: MessageFlags.Ephemeral,
                });
            }

        }
    }
}