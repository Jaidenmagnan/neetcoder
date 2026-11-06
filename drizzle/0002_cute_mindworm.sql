CREATE TABLE "recap_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" integer NOT NULL,
	"source_channel_id" integer NOT NULL,
	"destination_channel_id" integer NOT NULL,
	"time" varchar(5) NOT NULL,
	"timezone" varchar(64) NOT NULL,
	"last_successful_recap_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_successful_local_date" varchar(10),
	"claim_expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "recap_configurations" ADD CONSTRAINT "recap_configurations_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recap_configurations" ADD CONSTRAINT "recap_configurations_source_channel_id_channels_id_fk" FOREIGN KEY ("source_channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recap_configurations" ADD CONSTRAINT "recap_configurations_destination_channel_id_channels_id_fk" FOREIGN KEY ("destination_channel_id") REFERENCES "public"."channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "recap_configurations_guild_unique" ON "recap_configurations" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "recap_configurations_claim_idx" ON "recap_configurations" USING btree ("claim_expires_at");