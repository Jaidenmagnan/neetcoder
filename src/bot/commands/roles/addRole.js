const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { Roles, RoleGroups } = require('../../../models.js');

function isEmoji(str) {
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)+$/u;
    return emojiRegex.test(str.trim());
}

function extractDiscordEmojiId(emojiString) {
    if (isEmoji(emojiString)) {
        return emojiString;
    }

    const match = emojiString.match(/<a?:\w+:(\d+)>/);
    return match ? match[1] : null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolegroupadd')
        .setDescription('Adds a role to a group')

        .addStringOption((option) =>
            option
                .setName('groupname')
                .setDescription(
                    'the name of the group in which you are adding the role to'
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('emoji')
                .setDescription('The emoji for the role')
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('the role of which you are adding.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const groupName = interaction.options.getString('groupname');
        const roleId = interaction.options.getRole('role').id;
        const emoji = extractDiscordEmojiId(
            interaction.options.getString('emoji')
        );
        console.log(emoji);

        try {
            const doesEmojiExist = !!(
                interaction.guild.emojis.cache.get(emoji) || isEmoji(emoji)
            );
            if (!doesEmojiExist) {
                await interaction.reply({
                    content: 'The emoji does not exist!',
                    flags: MessageFlags.Ephemeral,
                });
                return;
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
            });

            await interaction.reply({
                content: 'role added to group: ' + groupName,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            await interaction.reply({
                content: 'issue adding to group' + error,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
