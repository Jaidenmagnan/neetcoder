const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { RunChannels } = require('../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strava-channel')
        .setDescription('Set the channel for automatic run updates')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel where run updates will be posted')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('channel');
            
            if (channel.type !== 0) { // 0 = GUILD_TEXT
                return interaction.reply({
                    content: '❌ Please select a text channel.',
                    ephemeral: true
                });
            }

            // upsert the channel configuration
            await RunChannels.upsert({
                guild_id: interaction.guild.id,
                channel_id: channel.id
            });

            const embed = new EmbedBuilder()
                .setColor('#FC4C02')
                .setTitle('🏃‍♂️ Run Channel Configured!')
                .setDescription(`Run updates will now be automatically posted to ${channel}`)
                .addFields({
                    name: '📝 How it works',
                    value: 'When connected users complete runs on Strava, they\'ll automatically appear here!',
                    inline: false
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error setting run channel:', error);
            await interaction.reply({
                content: '❌ Something went wrong setting the run channel.',
                ephemeral: true
            });
        }
    },
}; 