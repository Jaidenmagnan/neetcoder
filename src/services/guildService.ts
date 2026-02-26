import type { GuildRepository } from '../db/repositories/guildRepository';
import type { Guild } from '../types/guild';

export class GuildService {
    constructor(private guildRepository: GuildRepository) { }

    async ensureGuild(
        discordGuildId: string,
    ): Promise<Guild> {
        return this.guildRepository.findOneOrCreateByDiscordId(
            discordGuildId,
        );
    }
}
