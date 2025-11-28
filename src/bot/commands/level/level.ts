import type {
	ChatInputCommandInteraction,
	GuildMember as DiscordGuildMember,
} from 'discord.js';
import {
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from 'discord.js';
import { levelService, memberService } from '../../../di/container';

export const data = new SlashCommandBuilder()
	.setName('level')
	.setDescription('Replies with the user name')

	.addUserOption((option) =>
		option
			.setName('user')
			.setDescription('The user to get the level of')
			.setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const guildMember: DiscordGuildMember = (interaction.options.getMember(
		'user',
	) ?? interaction.member) as DiscordGuildMember;

	const member = await memberService.ensureMember(
		guildMember.user.id,
		guildMember.guild.id,
	);

	const level = await levelService.getLevel(member);

	const components = [
		new ContainerBuilder().addSectionComponents(
			new SectionBuilder()
				.setThumbnailAccessory(
					new ThumbnailBuilder().setURL(guildMember.user.displayAvatarURL()),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**${guildMember.user.username}**`,
					),
					new TextDisplayBuilder().setContent(`**AURA** Level: ${level}`),
					new TextDisplayBuilder().setContent(
						`Messages Sent: ${member.messageCount}`,
					),
				),
		),
	];

	await interaction.reply({
		flags: MessageFlags.IsComponentsV2,
		components: components,
	});
}
