import { DiscordChannelAdapter } from '../adapters/Discord/discordChannelAdapter.js';
import type { FeedRepository } from '../db/repositories/feedRepository.ts';
import type { Feed, CreateFeed } from '../types/feed';
import type { Guild } from '../types/guild.ts';
import type { ChannelService } from './channelService.js';

export class FeedService {
    constructor(private feedRepository: FeedRepository, private discordChannelAdapter: DiscordChannelAdapter, private channelService: ChannelService) { }

    // this should create the channel in the guild, add that channel to the db, then add it to the feeds table
    async monitorFeed(guild: Guild, channelName: string, url: string): Promise<Feed> {

        const discordChannel = await this.discordChannelAdapter.create(channelName, guild);

        if (!discordChannel) {
            throw "could not create channel";
        }

        const channel = await this.channelService.ensureChannel(guild.discordGuildId, discordChannel.id);

        const createFeed: CreateFeed = {
            feedUrl: url,
            channelId: channel.id,
        }

        const feed = await this.feedRepository.insert(createFeed);

        if (!feed) {
            throw "could not insert feed";
        }

        return feed;
    }
}
