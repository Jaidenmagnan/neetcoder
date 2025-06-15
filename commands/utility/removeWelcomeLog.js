const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Configurations } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove_welcome')
        .setDescription('removed the welcome log'),

    async execute(interaction) {
        let config_line = await Configurations.findOne({ where: { field: 'welcome_channel', guildid: interaction.guild.id } });

        if (!config_line) {
            await interaction.reply({
                content: 'no welcome log to remove!',
                flags: MessageFlags.Ephemeral
            })
        }

        await Configurations.destroy({ where: { field: 'welcome_channel', guildid: interaction.guild.id } });
        interaction.reply({
            content: `welcome log removed!`,
            flags: MessageFlags.Ephemeral,
        });


    },
};