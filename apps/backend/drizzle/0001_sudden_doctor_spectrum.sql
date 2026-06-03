CREATE TABLE `booking_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`guest_phone` text NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
