CREATE TABLE `unit_stock` (
	`unit_type` text PRIMARY KEY NOT NULL,
	`stock` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `request_group_id` text NOT NULL;