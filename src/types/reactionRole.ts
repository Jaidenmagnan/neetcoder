import type { InferSelectModel } from 'drizzle-orm';
import type {
	reactionRoleOptions,
	reactionRolePanels,
} from '../db/schema/reactionRoles';

export type ReactionRolePanel = InferSelectModel<typeof reactionRolePanels>;
export type ReactionRoleOption = InferSelectModel<typeof reactionRoleOptions>;
export type ReactionRoleMode = ReactionRolePanel['mode'];

/** A persisted panel augmented with the Discord snowflakes needed at runtime. */
export interface ResolvedReactionRolePanel extends ReactionRolePanel {
	discordChannelId: string;
	discordGuildId: string;
}

/** A reaction-role panel and its ordered role mappings. */
export interface ReactionRolePanelWithOptions {
	panel: ResolvedReactionRolePanel;
	options: ReactionRoleOption[];
}

/** A normalized emoji representation used by storage and gateway events. */
export interface NormalizedEmoji {
	key: string;
	display: string;
}
