CREATE TABLE `capture_import_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`file_path` text NOT NULL,
	`directory_path` text,
	`file_modified_at` integer NOT NULL,
	`file_size` integer NOT NULL,
	`last_imported_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `capture_import_sources_source_type_idx` ON `capture_import_sources` (`source_type`);--> statement-breakpoint
CREATE INDEX `capture_import_sources_directory_path_idx` ON `capture_import_sources` (`directory_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `capture_import_sources_source_file_unique` ON `capture_import_sources` (`source_type`,`file_path`);