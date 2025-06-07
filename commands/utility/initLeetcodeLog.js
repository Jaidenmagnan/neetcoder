
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Configurations } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('init_leetcode')
        .setDescription('initializes the leetcode log')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('the designated channel to report leetcode logs to.')
                .setRequired(true),
        ),

    async execute(interaction) {
        let config_line = await Configurations.findOne({ where: { field: 'leetcode_channel', guildid: interaction.guild.id } });
        const designated_channel = interaction.options.getChannel('channel');

        if (!config_line) {
            config_line = await Configurations.create({
                field: 'leetcode_channel',
                guildid: interaction.guild.id,
            });
        }

        await Configurations.update({ channel: designated_channel.id }, { where: { field: 'leetcode_channel', guildid: interaction.guild.id } });
        console.log(`All leetcode messages will be redirected to ${designated_channel.name}`);
        interaction.reply({
            content: `All leetcode messages will be redirected to ${designated_channel}`,
            flags: MessageFlags.Ephemeral,
        });


    },
};