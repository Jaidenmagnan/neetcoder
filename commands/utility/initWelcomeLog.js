const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Configurations } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init_welcome')
        .setDescription('initializes the welcome log')
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('the designated channel to report welcome logs to.')),

    async execute(interaction) {
        let config_line = await Configurations.findOne({ where: { field: 'welcome_channel' } });
        const designated_channel = interaction.options.getString('channel');

        if (!config_line) {
            config_line = await Configurations.create({
                field: 'welcome_channel',
            });
        }

        await Configurations.update({ channel: designated_channel }, { where: { field: 'welcome_channel' } });
        console.log(`All welcome messages will be redirected to ${designated_channel}`)
        interaction.reply({
            content: `All welcome messages will be redirected to ${designated_channel}`,
            flags: MessageFlags.Ephemeral,
        });


    },
};