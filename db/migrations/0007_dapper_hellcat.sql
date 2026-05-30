CREATE TABLE `batch_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action_type` text NOT NULL,
	`asset_ids` text NOT NULL,
	`performed_at` integer NOT NULL,
	`snapshot_summary` text
);
--> statement-breakpoint
CREATE INDEX `batch_audit_logs_performed_at_idx` ON `batch_audit_logs` (`performed_at`);