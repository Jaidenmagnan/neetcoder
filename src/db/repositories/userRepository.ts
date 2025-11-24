import { eq } from 'drizzle-orm';
import type { User } from '../../types/user';
import { db } from '../db';
import { users } from '../schema/users';

export class UserRepository {
	async findOneOrCreateByDiscordId(discordUserId: string): Promise<User> {
		let user = await this.findOneByDiscordId(discordUserId);

		if (!user) {
			user = await this.insert(discordUserId);
		}

		return user;
	}

	async findOneByDiscordId(discordUserId: string): Promise<User | undefined> {
		return db.query.users.findFirst({
			where: eq(users.discordUserId, discordUserId),
		});
	}

	async insert(discordUserId: string): Promise<User> {
		const user: User[] = (await db
			.insert(users)
			.values({
				discordUserId: discordUserId,
			})
			.returning()) as unknown as User[];

		return user[0];
	}
}
