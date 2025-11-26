import { eq, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import type { User } from '../../types/user';
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

	async find(id: number | number[]): Promise<User | User[] | undefined> {
		if (Array.isArray(id)) {
			return db.query.users.findMany({
				where: inArray(users.id, id),
			});
		}

		return db.query.users.findFirst({
			where: eq(users.id, id),
		});
	}

	async insert(discordUserId: string): Promise<User> {
		return await db
			.insert(users)
			.values({
				discordUserId: discordUserId,
			})
			.returning()
			.then((result) => result[0]);
	}
}
