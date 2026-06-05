ALTER TABLE `booking_requests` ADD `confirmation_code` text;
--> statement-breakpoint
WITH booking_groups AS (
  SELECT
    `request_group_id`,
    printf('%06d', 100000 + ROW_NUMBER() OVER (ORDER BY MIN(`created_at`), `request_group_id`) - 1) AS `confirmation_code`
  FROM `booking_requests`
  GROUP BY `request_group_id`
)
UPDATE `booking_requests`
SET `confirmation_code` = (
  SELECT `confirmation_code`
  FROM booking_groups
  WHERE booking_groups.`request_group_id` = booking_requests.`request_group_id`
)
WHERE `confirmation_code` IS NULL;
