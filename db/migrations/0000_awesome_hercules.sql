CREATE TABLE `asset_tags` (
	`asset_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`asset_id`, `tag_id`),
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `asset_tags_asset_id_idx` ON `asset_tags` (`asset_id`);--> statement-breakpoint
CREATE INDEX `asset_tags_tag_id_idx` ON `asset_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `asset_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`version` integer NOT NULL,
	`title_snapshot` text NOT NULL,
	`content_snapshot` text NOT NULL,
	`content_hash` text NOT NULL,
	`change_note` text,
	`score` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `asset_versions_asset_id_idx` ON `asset_versions` (`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `asset_versions_asset_version_unique` ON `asset_versions` (`asset_id`,`version`);--> statement-breakpoint
CREATE INDEX `asset_versions_created_at_idx` ON `asset_versions` (`created_at`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`sync_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`target_tool` text NOT NULL,
	`export_preset` text NOT NULL,
	`description` text,
	`scenario` text,
	`content` text NOT NULL,
	`content_hash` text NOT NULL,
	`status` text NOT NULL,
	`rating` integer,
	`visibility` text NOT NULL,
	`source` text NOT NULL,
	`source_url` text,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_used_at` integer,
	`last_synced_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_sync_id_unique` ON `assets` (`sync_id`);--> statement-breakpoint
CREATE INDEX `assets_slug_idx` ON `assets` (`slug`);--> statement-breakpoint
CREATE INDEX `assets_type_idx` ON `assets` (`type`);--> statement-breakpoint
CREATE INDEX `assets_target_tool_idx` ON `assets` (`target_tool`);--> statement-breakpoint
CREATE INDEX `assets_export_preset_idx` ON `assets` (`export_preset`);--> statement-breakpoint
CREATE INDEX `assets_status_idx` ON `assets` (`status`);--> statement-breakpoint
CREATE INDEX `assets_deleted_at_idx` ON `assets` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `assets_updated_at_idx` ON `assets` (`updated_at`);--> statement-breakpoint
CREATE INDEX `assets_pinned_idx` ON `assets` (`pinned`);--> statement-breakpoint
CREATE TABLE `collection_assets` (
	`collection_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `asset_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collection_assets_collection_id_idx` ON `collection_assets` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_assets_asset_id_idx` ON `collection_assets` (`asset_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `test_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`asset_version_id` text,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`input` text NOT NULL,
	`expected_output` text,
	`actual_output` text,
	`evaluation_criteria` text,
	`score` real,
	`note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_version_id`) REFERENCES `asset_versions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `test_cases_asset_id_idx` ON `test_cases` (`asset_id`);--> statement-breakpoint
CREATE INDEX `test_cases_asset_version_id_idx` ON `test_cases` (`asset_version_id`);--> statement-breakpoint
CREATE INDEX `test_cases_kind_idx` ON `test_cases` (`kind`);