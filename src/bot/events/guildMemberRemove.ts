import type {
	GuildMember as DiscordGuildMember,
	TextChannel as DiscordTextChannel,
} from 'discord.js';
import {
	ContainerBuilder,
	Events,
	MessageFlags,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from 'discord.js';
import {
	discordChannelAdapter,
	memberService,
	welcomeLogService,
} from '../../di/container';
import type { Channel } from '../../types/channel';
import type { Member } from '../../types/member';

module.exports = {
	name: Events.GuildMemberRemove,
	on: true,
	async execute(discordGuildMember: DiscordGuildMember) {
		const member: Member = await memberService.ensureMember(
			discordGuildMember.id,
			discordGuildMember.guild.id,
		);

		const channel: Channel | undefined =
			await welcomeLogService.getChannel(member);

		if (!channel) {
			return;
		}

		const discordChannel = (await discordChannelAdapter.resolve(
			channel,
		)) as DiscordTextChannel;

		const components = [
			new ContainerBuilder()
				.setAccentColor(16737095)
				.addSectionComponents(
					new SectionBuilder()
						.setThumbnailAccessory(
							new ThumbnailBuilder().setURL(
								discordGuildMember.user.displayAvatarURL(),
							),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								'**Goodbye from neetcoders!**',
							),
							new TextDisplayBuilder().setContent(
								`User: \`${discordGuildMember.user.username}\``,
							),
							new TextDisplayBuilder().setContent(
								'Created: ' +
									`\`${discordGuildMember.user.createdAt.toDateString()}\``,
							),
						),
				),
		];

		await discordChannel?.send({
			flags: MessageFlags.IsComponentsV2,
			components: components,
		});
	},
};
