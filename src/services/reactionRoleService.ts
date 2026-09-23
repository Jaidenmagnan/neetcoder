import type {
	ReactionRoleDiscordGateway,
	ValidateReactionRoleConfigurationInput,
} from '../adapters/Discord/discordReactionRoleAdapter';
import type {
	CreateReactionRolePanelInput,
	ReactionRoleRepository,
} from '../db/repositories/reactionRoleRepository';
import type {
	ReactionRoleMode,
	ReactionRolePanelWithOptions,
	ResolvedReactionRolePanel,
} from '../types/reactionRole';
import { ReactionRoleError } from './reactionRoleErrors';

const PANEL_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const MAX_OPTIONS_PER_PANEL = 20;

export interface ConfigureReactionRolePanelInput {
	discordGuildId: string;
	discordChannelId: string;
	actorId: string;
	name: string;
	mode: ReactionRoleMode;
	discordRoleId: string;
	emoji: string;
	title?: string;
	description?: string;
	existingMessageId?: string;
}

export interface ConfigureReactionRoleOptionInput {
	discordGuildId: string;
	actorId: string;
	panelName: string;
	discordRoleId: string;
	emoji: string;
}

export interface ReactionRoleEventInput {
	discordGuildId: string;
	discordMessageId: string;
	memberId: string;
	emojiKey: string;
}

export interface ReactionRoleOperationResult {
	panel: ReactionRolePanelWithOptions;
	warnings: string[];
}

/** Persistence operations consumed by the reaction-role domain service. */
export type ReactionRoleStore = Pick<
	ReactionRoleRepository,
	| 'addOption'
	| 'createPanelWithOption'
	| 'deleteByGuildAndMessage'
	| 'deletePanel'
	| 'findAllByGuild'
	| 'findByGuildAndMessage'
	| 'findByGuildAndName'
	| 'removeOption'
	| 'updateMode'
>;

/**
 * Coordinates persistent reaction-role configuration and idempotent member role
 * changes without coupling domain rules to discord.js event objects.
 */
export class ReactionRoleService {
	private readonly assignmentQueues = new Map<string, Promise<void>>();

	constructor(
		private readonly repository: ReactionRoleStore,
		private readonly discordGateway: ReactionRoleDiscordGateway,
	) {}

	/** Creates a managed panel with one initial mapping. */
	async createPanel(
		input: ConfigureReactionRolePanelInput,
	): Promise<ReactionRoleOperationResult> {
		const name = this.normalizePanelName(input.name);
		const emoji = await this.discordGateway.validateConfiguration({
			...this.validationInput(input),
		});
		let messageId: string | undefined;
		let persisted: ReactionRolePanelWithOptions | undefined;

		try {
			messageId = await this.discordGateway.createPanelMessage({
				discordGuildId: input.discordGuildId,
				discordChannelId: input.discordChannelId,
				name,
				title: input.title,
				description: input.description,
				mode: input.mode,
				discordRoleId: input.discordRoleId,
				emoji,
			});
			persisted = await this.repository.createPanelWithOption({
				...this.persistenceInput(input, name, messageId, emoji),
				isManagedMessage: true,
			});
			await this.discordGateway.addBotReaction(persisted, emoji.display);

			return { panel: persisted, warnings: [] };
		} catch (error) {
			if (persisted) {
				const panelToRemove = persisted;
				await this.bestEffort(() =>
					this.repository.deletePanel(panelToRemove.panel.id),
				);
			}
			if (messageId) {
				const messageToDelete = messageId;
				await this.bestEffort(() =>
					this.discordGateway.deleteMessage(
						input.discordGuildId,
						input.discordChannelId,
						messageToDelete,
					),
				);
			}
			throw this.configurationError(error);
		}
	}

	/** Attaches a persistent panel configuration to an existing message. */
	async attachPanel(
		input: ConfigureReactionRolePanelInput & { existingMessageId: string },
	): Promise<ReactionRoleOperationResult> {
		const name = this.normalizePanelName(input.name);
		const emoji = await this.discordGateway.validateConfiguration({
			...this.validationInput(input),
			existingMessageId: input.existingMessageId,
		});
		let persisted: ReactionRolePanelWithOptions | undefined;

		try {
			persisted = await this.repository.createPanelWithOption({
				...this.persistenceInput(input, name, input.existingMessageId, emoji),
				isManagedMessage: false,
			});
			await this.discordGateway.addBotReaction(persisted, emoji.display);

			return { panel: persisted, warnings: [] };
		} catch (error) {
			if (persisted) {
				const panelToRemove = persisted;
				await this.bestEffort(() =>
					this.repository.deletePanel(panelToRemove.panel.id),
				);
				await this.bestEffort(() =>
					this.discordGateway.removeBotReaction(panelToRemove, emoji.key),
				);
			}
			throw this.configurationError(error);
		}
	}

	/** Adds a validated emoji-to-role mapping and updates the panel. */
	async addOption(
		input: ConfigureReactionRoleOptionInput,
	): Promise<ReactionRoleOperationResult> {
		const panel = await this.requirePanel(
			input.discordGuildId,
			input.panelName,
		);

		if (panel.options.length >= MAX_OPTIONS_PER_PANEL) {
			throw new ReactionRoleError(
				'limit-reached',
				`A reaction-role panel supports at most ${MAX_OPTIONS_PER_PANEL} roles.`,
			);
		}

		const emoji = await this.discordGateway.validateConfiguration({
			discordGuildId: input.discordGuildId,
			discordChannelId: panel.panel.discordChannelId,
			actorId: input.actorId,
			discordRoleId: input.discordRoleId,
			emoji: input.emoji,
			mode: panel.panel.mode,
			existingMessageId: panel.panel.discordMessageId,
		});

		if (
			panel.options.some(
				(option) =>
					option.discordRoleId === input.discordRoleId ||
					option.emojiKey === emoji.key,
			)
		) {
			throw new ReactionRoleError(
				'duplicate',
				'That role or emoji is already configured on this panel.',
			);
		}

		let added = false;
		try {
			await this.repository.addOption({
				panelId: panel.panel.id,
				discordRoleId: input.discordRoleId,
				emojiKey: emoji.key,
				emojiDisplay: emoji.display,
			});
			added = true;
			const updated = await this.requirePanel(
				input.discordGuildId,
				panel.panel.name,
			);
			await this.discordGateway.addBotReaction(updated, emoji.display);
			const warnings = await this.discordGateway.synchronizePanel(updated);

			return { panel: updated, warnings };
		} catch (error) {
			if (added) {
				await this.bestEffort(() =>
					this.repository.removeOption(panel.panel.id, input.discordRoleId),
				);
				await this.bestEffort(() =>
					this.discordGateway.removeBotReaction(panel, emoji.key),
				);
				await this.bestEffort(() =>
					this.discordGateway.synchronizePanel(panel),
				);
			}
			throw this.configurationError(error);
		}
	}

	/** Removes one mapping while preserving the Discord reaction history. */
	async removeOption(
		discordGuildId: string,
		panelName: string,
		discordRoleId: string,
	): Promise<ReactionRoleOperationResult> {
		const panel = await this.requirePanel(discordGuildId, panelName);
		const removed = await this.repository.removeOption(
			panel.panel.id,
			discordRoleId,
		);

		if (!removed) {
			throw new ReactionRoleError(
				'not-found',
				'That role is not configured on this panel.',
			);
		}

		try {
			const updated = await this.requirePanel(discordGuildId, panel.panel.name);
			const warnings = await this.discordGateway.synchronizePanel(updated);
			return { panel: updated, warnings };
		} catch (error) {
			await this.bestEffort(() =>
				this.repository.addOption({
					panelId: panel.panel.id,
					discordRoleId: removed.discordRoleId,
					emojiKey: removed.emojiKey,
					emojiDisplay: removed.emojiDisplay,
				}),
			);
			await this.bestEffort(() => this.discordGateway.synchronizePanel(panel));
			throw error;
		}
	}

	/** Changes selection behavior after validating the required Discord access. */
	async setMode(
		discordGuildId: string,
		panelName: string,
		mode: ReactionRoleMode,
	): Promise<ReactionRoleOperationResult> {
		const panel = await this.requirePanel(discordGuildId, panelName);
		const previousMode = panel.panel.mode;
		await this.repository.updateMode(panel.panel.id, mode);

		try {
			const updated = await this.requirePanel(discordGuildId, panel.panel.name);
			const warnings = await this.discordGateway.synchronizePanel(updated);
			return { panel: updated, warnings };
		} catch (error) {
			await this.bestEffort(() =>
				this.repository.updateMode(panel.panel.id, previousMode),
			);
			await this.bestEffort(() => this.discordGateway.synchronizePanel(panel));
			throw error;
		}
	}

	/** Re-renders a managed panel and restores missing bot reactions. */
	async synchronizePanel(
		discordGuildId: string,
		panelName: string,
	): Promise<ReactionRoleOperationResult> {
		const panel = await this.requirePanel(discordGuildId, panelName);
		const warnings = await this.discordGateway.synchronizePanel(panel);
		return { panel, warnings };
	}

	/** Lists all panels configured for a guild. */
	async listPanels(
		discordGuildId: string,
	): Promise<ResolvedReactionRolePanel[]> {
		return this.repository.findAllByGuild(discordGuildId);
	}

	/** Detaches configuration without deleting or altering the Discord message. */
	async removePanel(discordGuildId: string, panelName: string): Promise<void> {
		const panel = await this.requirePanel(discordGuildId, panelName);
		await this.repository.deletePanel(panel.panel.id);
	}

	/** Applies the configured action for an added reaction. */
	async handleReactionAdded(input: ReactionRoleEventInput): Promise<void> {
		const config = await this.repository.findByGuildAndMessage(
			input.discordGuildId,
			input.discordMessageId,
		);
		const selected = config?.options.find(
			(option) => option.emojiKey === input.emojiKey,
		);

		if (!config || !selected) return;

		const apply = async () => {
			if (config.panel.mode === 'exclusive') {
				await this.discordGateway.validateAssignableRole(
					input.discordGuildId,
					selected.discordRoleId,
				);
				for (const option of config.options) {
					if (option.id === selected.id) continue;
					await this.discordGateway.removeMemberRole(
						input.discordGuildId,
						input.memberId,
						option.discordRoleId,
					);
					await this.discordGateway.removeMemberReaction(
						config,
						option.emojiKey,
						input.memberId,
					);
				}
			}

			await this.discordGateway.addMemberRole(
				input.discordGuildId,
				input.memberId,
				selected.discordRoleId,
			);
		};

		if (config.panel.mode === 'exclusive') {
			await this.enqueueAssignment(config.panel.id, input.memberId, apply);
		} else {
			await apply();
		}
	}

	/** Removes the configured role after its reaction is removed. */
	async handleReactionRemoved(input: ReactionRoleEventInput): Promise<void> {
		const config = await this.repository.findByGuildAndMessage(
			input.discordGuildId,
			input.discordMessageId,
		);
		const selected = config?.options.find(
			(option) => option.emojiKey === input.emojiKey,
		);

		if (!config || !selected) return;

		const remove = () =>
			this.discordGateway.removeMemberRole(
				input.discordGuildId,
				input.memberId,
				selected.discordRoleId,
			);

		if (config.panel.mode === 'exclusive') {
			await this.enqueueAssignment(config.panel.id, input.memberId, remove);
		} else {
			await remove();
		}
	}

	/** Removes stale configuration after Discord deletes its message. */
	async handleMessageDeleted(
		discordGuildId: string,
		discordMessageId: string,
	): Promise<boolean> {
		return this.repository.deleteByGuildAndMessage(
			discordGuildId,
			discordMessageId,
		);
	}

	private async requirePanel(
		discordGuildId: string,
		panelName: string,
	): Promise<ReactionRolePanelWithOptions> {
		const panel = await this.repository.findByGuildAndName(
			discordGuildId,
			this.normalizePanelName(panelName),
		);

		if (!panel) {
			throw new ReactionRoleError(
				'not-found',
				'Reaction-role panel not found.',
			);
		}

		return panel;
	}

	private normalizePanelName(name: string): string {
		const normalized = name.trim().toLowerCase();
		if (!PANEL_NAME_PATTERN.test(normalized)) {
			throw new ReactionRoleError(
				'invalid-name',
				'Panel names must use 1-32 lowercase letters, numbers, hyphens, or underscores.',
			);
		}
		return normalized;
	}

	private validationInput(
		input: ConfigureReactionRolePanelInput,
	): ValidateReactionRoleConfigurationInput {
		return {
			discordGuildId: input.discordGuildId,
			discordChannelId: input.discordChannelId,
			actorId: input.actorId,
			discordRoleId: input.discordRoleId,
			emoji: input.emoji,
			mode: input.mode,
			existingMessageId: input.existingMessageId,
		};
	}

	private persistenceInput(
		input: ConfigureReactionRolePanelInput,
		name: string,
		discordMessageId: string,
		emoji: { key: string; display: string },
	): Omit<CreateReactionRolePanelInput, 'isManagedMessage'> {
		return {
			discordGuildId: input.discordGuildId,
			discordChannelId: input.discordChannelId,
			discordMessageId,
			name,
			mode: input.mode,
			title: input.title,
			description: input.description,
			discordRoleId: input.discordRoleId,
			emojiKey: emoji.key,
			emojiDisplay: emoji.display,
		};
	}

	private async enqueueAssignment(
		panelId: number,
		memberId: string,
		operation: () => Promise<void>,
	): Promise<void> {
		const key = `${panelId}:${memberId}`;
		const previous = this.assignmentQueues.get(key) ?? Promise.resolve();
		const current = previous.catch(() => undefined).then(operation);
		this.assignmentQueues.set(key, current);

		try {
			await current;
		} finally {
			if (this.assignmentQueues.get(key) === current) {
				this.assignmentQueues.delete(key);
			}
		}
	}

	private configurationError(error: unknown): Error {
		if (error instanceof ReactionRoleError) return error;
		if (this.isUniqueViolation(error)) {
			return new ReactionRoleError(
				'duplicate',
				'A panel, message, role, or emoji with that value is already configured.',
				{ cause: error },
			);
		}
		return error instanceof Error
			? error
			: new Error('Unknown reaction-role error');
	}

	private isUniqueViolation(error: unknown): boolean {
		return (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			error.code === '23505'
		);
	}

	private async bestEffort(operation: () => Promise<unknown>): Promise<void> {
		try {
			await operation();
		} catch (error) {
			console.error('Reaction-role compensation failed.', error);
		}
	}
}
