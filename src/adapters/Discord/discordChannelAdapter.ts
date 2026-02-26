import { ChannelType, type Client, type Channel as DiscordChannel } from 'discord.js';
import type { GuildRepository } from '../../db/repositories/guildRepository';
import type { Guild } from '../../types/guild.ts';
import type { Channel } from '../../types/channel';
import { ChannelRepository } from '../../db/repositories/channelRepository';

export class DiscordChannelAdapter {
    constructor(
        private client: Client,
        private guildRepository: GuildRepository,
    ) { }

    async resolve(channel: Channel): Promise<DiscordChannel | null> {
        const guildId = channel.guildId;

        if (!channel) {
            return null;
        }

        const guild = await this.guildRepository.find(guildId);

        if (!guild?.discordGuildId) {
            return null;
        }

        const discordGuild = await this.client.guilds.fetch(
            guild?.discordGuildId || '',
        );

        return discordGuild.channels.fetch(channel.discordChannelId);
    }

    async create(name: string, guild: Guild): Promise<DiscordChannel | null> {
        const discordGuild = await this.client.guilds.fetch(guild.discordGuildId);

        return await discordGuild.channels.create({
            name: name,
            type: ChannelType.GuildText
        });
    }
}
