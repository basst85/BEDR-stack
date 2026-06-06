CREATE TABLE `booking_email_logs` (
  `id` text PRIMARY KEY NOT NULL,
  `request_group_id` text NOT NULL,
  `email_type` text NOT NULL,
  `provider` text NOT NULL,
  `provider_message_id` text,
  `status` text NOT NULL,
  `recipient_email` text NOT NULL,
  `subject` text NOT NULL,
  `html_body` text NOT NULL,
  `text_body` text NOT NULL,
  `error_message` text,
  `created_at` integer NOT NULL
);
