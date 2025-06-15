const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Configurations } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_moderation')
        .setDescription('removed the moderation log'),

    async execute(interaction) {
        let config_line = await Configurations.findOne({ where: { field: 'moderation_channel', guildid: interaction.guild.id } });

        if (!config_line) {
            await interaction.reply({
                content: 'no moderation log to remove!',
                flags: MessageFlags.Ephemeral
            })
        }

        await Configurations.destroy({ where: { field: 'moderation_channel', guildid: interaction.guild.id } });
        interaction.reply({
            content: `moderation log removed!`,
            flags: MessageFlags.Ephemeral,
        });


    },
};