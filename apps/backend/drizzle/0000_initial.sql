CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `password_hash` text NOT NULL,
  `created_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
