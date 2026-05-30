CREATE TABLE `capture_inbox_items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`raw_content` text NOT NULL,
	`source_type` text NOT NULL,
	`source_path` text,
	`source_timestamp` integer,
	`extraction_note` text,
	`status` text NOT NULL,
	`converted_asset_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`converted_asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `capture_inbox_items_source_type_idx` ON `capture_inbox_items` (`source_type`);--> statement-breakpoint
CREATE INDEX `capture_inbox_items_status_idx` ON `capture_inbox_items` (`status`);--> statement-breakpoint
CREATE INDEX `capture_inbox_items_source_path_idx` ON `capture_inbox_items` (`source_path`);--> statement-breakpoint
CREATE INDEX `capture_inbox_items_created_at_idx` ON `capture_inbox_items` (`created_at`);