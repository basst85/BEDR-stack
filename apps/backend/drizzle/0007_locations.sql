CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `locations` (`id`, `name`, `address`, `sort_order`, `updated_at`) VALUES
	('crossvillage', 'CrossVillage Zeddam', 'Zeddamseweg 16, Kilder', 0, (unixepoch() * 1000)),
	('totalrent', 'Totalrent', 'Stirlingstraat 5, 7037 DG Beek Gem Montferland', 1, (unixepoch() * 1000));
