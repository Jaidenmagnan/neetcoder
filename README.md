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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Jaidenmagnan/neetcoder&type=Date)](https://www.star-history.com/#Jaidenmagnan/neetcoder&Date)

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
