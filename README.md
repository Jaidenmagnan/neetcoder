# neetcoder

to run use

`npm install`
then `npm run dev`
to start the bot.

Use `docker compose up` to spin up the database.

You will need to create your own bot to set the `CLIENT_ID`, `CLIENT_SECRET` and `GUILD_ID`.

https://discordjs.guide/legacy/app-creation/project-setup 

## Reaction roles

Server members with **Manage Roles** can configure persistent reaction-role
panels with `/reaction-role`. The bot can publish a Components V2 panel or
attach mappings to an existing message. Normal panels allow multiple roles;
exclusive panels keep one selected role at a time.

The bot role must be above every self-assignable role and have **Manage Roles**.
In the panel channel it also needs **View Channel**, **Read Message History**,
and **Add Reactions**. Bot-created panels need **Send Messages**, while exclusive
panels additionally need **Manage Messages** so old member reactions can be
removed. Privileged and moderation roles cannot be exposed for self-assignment.

Common administration commands:

- `/reaction-role panel create` publishes a new panel with its first mapping.
- `/reaction-role panel attach` configures an existing message.
- `/reaction-role option add` and `/reaction-role option remove` edit mappings.
- `/reaction-role panel sync` repairs panel rendering and seed reactions.
- `/reaction-role panel remove` detaches configuration without deleting the message.

Apply database migrations with `npm run migrate` before starting a version that
contains new schema changes.

## Daily recaps

Server members with **Manage Server** can configure one scheduled recap with
`/recap setup`. Choose the conversation channel, recap channel, daily time, and
an IANA timezone such as `America/New_York`. Times follow daylight-saving
changes automatically.

Each successful run covers messages since the previous successful recap, up to
the newest 1,000 messages. Recaps present **Top Discussions**, **Points of
Agreement**, **Where Views Differ**, and **Notable Links** without naming or
ranking participants. Empty periods are skipped. Use `/recap preview` for a
private preview, `/recap status` to inspect the schedule, and `/recap disable`
to stop it.

Set `OPENAI_API_KEY` for summary generation. `OPENAI_MODEL` is optional and
defaults to `gpt-5.4-mini-2026-03-17`. The bot needs **View Channel** and **Read
Message History** in the source channel, plus **View Channel**, **Send
Messages**, and **Embed Links** in the recap channel. Apply database migrations
before enabling the feature.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Jaidenmagnan/neetcoder&type=Date)](https://www.star-history.com/#Jaidenmagnan/neetcoder&Date)

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
