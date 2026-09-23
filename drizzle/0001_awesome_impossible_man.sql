CREATE TYPE "public"."reaction_role_mode" AS ENUM('normal', 'exclusive');--> statement-breakpoint
CREATE TABLE "reaction_role_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"panel_id" integer NOT NULL,
	"discord_role_id" varchar NOT NULL,
	"emoji_key" varchar(255) NOT NULL,
	"emoji_display" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reaction_role_panels" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" integer NOT NULL,
	"channel_id" integer NOT NULL,
	"name" varchar(32) NOT NULL,
	"discord_message_id" varchar NOT NULL,
	"mode" "reaction_role_mode" NOT NULL,
	"is_managed_message" boolean NOT NULL,
	"title" varchar(100),
	"description" text
);
--> statement-breakpoint
ALTER TABLE "reaction_role_options" ADD CONSTRAINT "reaction_role_options_panel_id_reaction_role_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."reaction_role_panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_role_panels" ADD CONSTRAINT "reaction_role_panels_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_role_panels" ADD CONSTRAINT "reaction_role_panels_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reaction_role_options_panel_role_unique" ON "reaction_role_options" USING btree ("panel_id","discord_role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reaction_role_options_panel_emoji_unique" ON "reaction_role_options" USING btree ("panel_id","emoji_key");--> statement-breakpoint
CREATE UNIQUE INDEX "reaction_role_panels_guild_name_unique" ON "reaction_role_panels" USING btree ("guild_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "reaction_role_panels_guild_message_unique" ON "reaction_role_panels" USING btree ("guild_id","discord_message_id");--> statement-breakpoint
CREATE INDEX "reaction_role_panels_message_idx" ON "reaction_role_panels" USING btree ("discord_message_id");