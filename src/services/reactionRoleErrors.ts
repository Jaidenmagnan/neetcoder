export type ReactionRoleErrorCode =
	| 'duplicate'
	| 'invalid-emoji'
	| 'invalid-name'
	| 'limit-reached'
	| 'missing-permission'
	| 'not-found'
	| 'unsafe-role'
	| 'validation';

/** A user-safe error raised while configuring or applying reaction roles. */
export class ReactionRoleError extends Error {
	constructor(
		public readonly code: ReactionRoleErrorCode,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'ReactionRoleError';
	}
}
