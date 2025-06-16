const { Events, MessageFlags, EmbedBuilder } = require('discord.js');
const { Votes, Configurations } = require('../../models.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isButton()) {
            if (interaction.customId.startsWith("vote_timeout_")) {
                await votetimeout(interaction);
            }
        }

        // for the commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.log('MESSAGE SENT');
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
                else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        }
    },
};

async function votetimeout(interaction) {
    let vote = await Votes.findOne({
        where: {
            messageid: interaction.message.id,
            guildid: interaction.guild.id,
            userid: interaction.user.id,
        },
    });

    if (vote) {
        await interaction.reply({
            content: 'you already voted!',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const config = await Configurations.findOne({
        where: {
            messageid: interaction.message.id,
            guildid: interaction.guild.id,
            field: 'vote_timeout',
        },
    });

    if (!config) {
        await interaction.reply({
            content: 'this vote is closed!',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const votes_needed = config.get('votes_needed');
    const length = config.get('length_of_timeout') * 60 * 1000;
    const user_id = config.get('userid');

    let decision;
    if (interaction.customId == "vote_timeout_yes") {
        decision = "YES";
    }

    if (interaction.customId == "vote_timeout_no") {
        decision = "NO";
    }

    await interaction.deferUpdate();

    vote = await Votes.create({
        userid: interaction.user.id,
        messageid: interaction.message.id,
        guildid: interaction.guild.id,
        votestatus: decision,
    });

    const votes = await Votes.findAll({
        where: {
            guildid: interaction.guild.id,
            messageid: interaction.message.id,
        },
    });

    let num_yes = 0;


    const member = await interaction.guild.members.fetch(user_id);

    votes.forEach(element => {
        if (element.get('votestatus') === "YES") {
            num_yes += 1;
        }
    });

    const updatedEmbed = new EmbedBuilder()
        .setTitle('IMPORTANT NOTICE!')
        .setDescription(`Should ${member.displayName} be banished into the low-level-thinker realm?`)
        .setColor("#FF6347")
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 128 }))
        .addFields({
            name: 'Votes',
            value: `${num_yes}/${votes_needed}`,
            inline: true,
        });

    await interaction.message.edit({ embeds: [updatedEmbed] });

    if (num_yes >= votes_needed) {
        await interaction.channel.send({
            content: "peace out lil bro",
        });

        await member.timeout(length, 'Timed out!');

        await Configurations.destroy({
            where: {
                id: config.get('id'),
            },
        });

        await Votes.destroy({
            where: {
                messageid: interaction.message.id,
                guildid: interaction.guild.id,
            },
        });
    };

}