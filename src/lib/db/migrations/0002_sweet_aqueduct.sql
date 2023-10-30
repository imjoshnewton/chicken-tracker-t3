CREATE TABLE `flocknerd_DateTest` (
	`dt_column` datetime NOT NULL,
	`d_column` date NOT NULL
);
--> statement-breakpoint
ALTER TABLE `flocknerd_EggLog` MODIFY COLUMN `date` date NOT NULL;