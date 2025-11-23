const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { ChannelStats } = require('../../../models.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channelstats')
        .setDescription(
            'get the stats of the top 5 channels, this feature is WIP'
        )

        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription("which channel you're looking at")
                .setRequired(false)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        // if the channel is found just print how many messages sent in the channel
        if (channel) {
            console.log(channel.id);
            let dbChannel = await ChannelStats.findOne({
                where: {
                    channel_id: channel.id,
                },
            });

            if (!dbChannel) {
                console.log('CHANNEL STATS NOT FOUND');
                dbChannel = await ChannelStats.create({
                    guild_id: interaction.guild.id,
                    channel_id: channel.id,
                    message_count: 0,
                });
            }
            const messages = dbChannel.message_count;

            await interaction.reply({
                content: channel.name + ' has sent ' + messages + ' messages',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        topFive = await ChannelStats.findAll({
            where: {
                guild_id: interaction.guild.id,
            },
            order: [['message_count', 'DESC']],
            limit: 5,
        });

        data = {};
        topFive.forEach((channel) => {
            data[
                interaction.guild.channels.cache.get(channel.channel_id).name
            ] = channel.message_count;
        });

        const chartBuffer = createTextChart(data, 'channel data');

        await interaction.channel.send({
            content: chartBuffer,
        });

        await interaction.reply({
            content: 'chart sent!',
            flags: MessageFlags.Ephemeral,
        });
    },
};

function createTextChart(data, title = 'data') {
    const maxValue = Math.max(...Object.values(data));
    const maxBarLength = 30;

    let chart = `\`\`\`\n${title}\n${'='.repeat(title.length)}\n\n`;

    for (const [name, count] of Object.entries(data)) {
        const barLength = Math.round((count / maxValue) * maxBarLength);
        const bar = '█'.repeat(barLength);
        const padding = ' '.repeat(Math.max(0, 25 - name.length));
        chart += `${name}${padding} │${bar} ${count}\n`;
    }

    chart += '```';
    return chart;
}
