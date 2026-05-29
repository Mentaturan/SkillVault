CREATE TABLE `deployment_records` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`deployment_target_id` text NOT NULL,
	`target_directory_path` text NOT NULL,
	`target_file_path` text NOT NULL,
	`target_filename` text NOT NULL,
	`deployed_content_hash` text NOT NULL,
	`last_backup_path` text,
	`last_deployed_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deployment_target_id`) REFERENCES `deployment_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deployment_records_asset_target_unique` ON `deployment_records` (`asset_id`,`deployment_target_id`);--> statement-breakpoint
CREATE INDEX `deployment_records_asset_id_idx` ON `deployment_records` (`asset_id`);--> statement-breakpoint
CREATE INDEX `deployment_records_target_id_idx` ON `deployment_records` (`deployment_target_id`);--> statement-breakpoint
CREATE TABLE `deployment_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`path` text,
	`enabled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deployment_targets_key_unique` ON `deployment_targets` (`key`);