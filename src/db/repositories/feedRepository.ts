import { CreateFeed, Feed } from "../../types/feed"
import { feeds } from "../schema/feeds"
import { db } from '../../db/db';

export class FeedRepository {
    constructor() { }

    async insert(createFeed: CreateFeed): Promise<Feed | undefined> {
        const [inserted] = await db
            .insert(feeds)
            .values(createFeed)
            .returning();

        return inserted;
    }

    async findAll(): Promise<Feed[]> {
        return await db.query.feeds.findMany();
    }

}
