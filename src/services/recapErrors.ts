export class RecapError extends Error {
	constructor(
		public readonly code:
			| 'invalid-schedule'
			| 'not-configured'
			| 'no-messages'
			| 'discord-error'
			| 'summarizer-error',
		message: string,
	) {
		super(message);
		this.name = 'RecapError';
	}
}
