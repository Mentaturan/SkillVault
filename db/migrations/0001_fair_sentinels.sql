CREATE TABLE `project_assets` (
	`project_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `asset_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_assets_project_id_idx` ON `project_assets` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_assets_asset_id_idx` ON `project_assets` (`asset_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`path` text,
	`icon` text,
	`color` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
