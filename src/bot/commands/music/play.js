const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song')
        .addStringOption(option => 
            option.setName('song')
            .setDescription('song to play')
            .setRequired(true)
        ),
    async execute( /** @type {import('discord.js').Interaction} */interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getString('song', true);
        interaction.deferReply();

        const channel = interaction.member.voice.channel;
        const mychannel = interaction.guild.members.me.voice.channel;
        if(!channel) 
            return interaction.followUp("you need to be in a vc to play music");
        if(mychannel && mychannel != channel) 
            return interaction.followUp("get in MY channel kitten");

        try {
            const result = await player.play(channel, query, {
                nodeOptions: {metadata: {channel: interaction.channel}}
            });

            return interaction.followUp(`added ${result.track.title} to queue`);
        }
        catch (error) {
            console.error(error);
            return interaction.followUp("oopsie daisies :broken_heart:");
        }
    }
}