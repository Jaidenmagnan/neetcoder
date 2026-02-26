import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";

import { assertExists } from "../../../../utils/assertions"

import { feedService, guildService } from "../../../../di/container";

export const data = (subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
        .setName('monitor')
        .setDescription("add a channel to monitor RSS feeds")
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName('url')
                .setDescription('The url of the blog to monitor')
                .setRequired(true),
        )
        .addStringOption((option: SlashCommandStringOption) =>
            option
                .setName('channel-name')
                .setDescription('The name of the channel to be created that will monitor the feed')
                .setRequired(true),
        );

export const execute = async (interaction: ChatInputCommandInteraction) => {
    const url = interaction.options.getString('url', true);
    const channelName = interaction.options.getString('channel-name', true);

    const guild = assertExists(await guildService.ensureGuild(assertExists(interaction.guild, "blogkitty monitor").id), "blogkitty monitor");

    feedService.monitorFeed(guild, channelName, url)

    interaction.reply({
        content: "hello"
    });
}

