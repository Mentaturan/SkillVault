ALTER TABLE `assets` ADD `review_due_at` integer;--> statement-breakpoint
CREATE INDEX `assets_review_due_at_idx` ON `assets` (`review_due_at`);