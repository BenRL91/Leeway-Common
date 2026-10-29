CREATE TABLE `notification_demo_access` (
	`subject` text NOT NULL,
	`review_id` text NOT NULL,
	`allowed` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`subject`, `review_id`)
);
--> statement-breakpoint
CREATE TABLE `notification_events` (
	`key` text PRIMARY KEY NOT NULL,
	`app` text NOT NULL,
	`event_id` text NOT NULL,
	`digest` text NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL,
	`actor` text,
	`occurred_at` text NOT NULL,
	`received_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_events_time` ON `notification_events` (`received_at`,`key`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`subject` text PRIMARY KEY NOT NULL,
	`in_app` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notification_reads` (
	`event_key` text NOT NULL,
	`subject` text NOT NULL,
	`read_at` text,
	`version` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`event_key`, `subject`),
	FOREIGN KEY (`event_key`) REFERENCES `notification_events`(`key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notification_recipients` (
	`event_key` text NOT NULL,
	`recipient_key` text NOT NULL,
	PRIMARY KEY(`event_key`, `recipient_key`),
	FOREIGN KEY (`event_key`) REFERENCES `notification_events`(`key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_recipient_lookup` ON `notification_recipients` (`recipient_key`,`event_key`);