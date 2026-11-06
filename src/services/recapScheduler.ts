import type { RecapService } from './recapService';

const POLL_INTERVAL_MILLISECONDS = 60_000;

/** Polls persisted recap schedules; the service itself provides run leases. */
export class RecapScheduler {
	private timer: NodeJS.Timeout | undefined;

	constructor(private readonly recapService: RecapService) {}

	start(): void {
		if (this.timer) return;
		void this.tick();
		this.timer = setInterval(
			() => void this.tick(),
			POLL_INTERVAL_MILLISECONDS,
		);
		this.timer.unref();
	}

	private async tick(): Promise<void> {
		try {
			await this.recapService.runDue();
		} catch (error) {
			console.error('Recap scheduler poll failed.', error);
		}
	}
}
