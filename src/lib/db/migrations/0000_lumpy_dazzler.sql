CREATE TABLE `flocknerd_Account` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(191),
	`scope` varchar(191),
	`id_token` text,
	`session_state` varchar(191),
	CONSTRAINT `flocknerd_Account_id` PRIMARY KEY(`id`),
	CONSTRAINT `Account_provider_providerAccountId_key` UNIQUE(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Breed` (
	`id` varchar(191) NOT NULL,
	`name` text,
	`description` text,
	`count` smallint NOT NULL,
	`imageUrl` text,
	`averageProduction` double NOT NULL,
	`flockId` varchar(191) NOT NULL,
	`breed` text NOT NULL DEFAULT (''),
	`deleted` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `flocknerd_Breed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_EggLog` (
	`id` varchar(191) NOT NULL,
	`count` int NOT NULL,
	`notes` text,
	`date` datetime(3) NOT NULL,
	`flockId` varchar(191) NOT NULL,
	`breedId` varchar(191),
	CONSTRAINT `flocknerd_EggLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Expense` (
	`id` varchar(191) NOT NULL,
	`amount` double NOT NULL,
	`date` datetime(3) NOT NULL,
	`memo` text,
	`flockId` varchar(191) NOT NULL,
	`category` varchar(191) NOT NULL DEFAULT 'other',
	CONSTRAINT `flocknerd_Expense_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Flock` (
	`id` varchar(191) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`type` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`zip` varchar(191) DEFAULT '',
	`deleted` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `flocknerd_Flock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Notification` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`message` text NOT NULL,
	`date` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`read` tinyint NOT NULL DEFAULT 0,
	`readDate` datetime(3),
	`userId` varchar(191) NOT NULL,
	`link` varchar(191) NOT NULL,
	`action` varchar(191) NOT NULL DEFAULT 'View',
	CONSTRAINT `flocknerd_Notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Session` (
	`id` varchar(191) NOT NULL,
	`sessionToken` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `flocknerd_Session_id` PRIMARY KEY(`id`),
	CONSTRAINT `Session_sessionToken_key` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_Task` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` varchar(191) NOT NULL,
	`dueDate` datetime(3) NOT NULL,
	`recurrence` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL DEFAULT 'Incomplete',
	`userId` varchar(191) NOT NULL,
	`flockId` varchar(191) NOT NULL,
	`completed` tinyint NOT NULL DEFAULT 0,
	`completedAt` datetime(3),
	CONSTRAINT `flocknerd_Task_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_User` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191),
	`email` varchar(191),
	`emailVerified` datetime(3),
	`image` text,
	`defaultFlock` varchar(191) NOT NULL DEFAULT '',
	`clerkId` varchar(191),
	CONSTRAINT `flocknerd_User_id` PRIMARY KEY(`id`),
	CONSTRAINT `User_email_key` UNIQUE(`email`),
	CONSTRAINT `User_clerkId_key` UNIQUE(`clerkId`)
);
--> statement-breakpoint
CREATE TABLE `flocknerd_VerificationToken` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `flocknerd_VerificationToken_token` PRIMARY KEY(`token`),
	CONSTRAINT `VerificationToken_identifier_token_key` UNIQUE(`identifier`,`token`),
	CONSTRAINT `VerificationToken_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE INDEX `Account_userId_idx` ON `flocknerd_Account` (`userId`);--> statement-breakpoint
CREATE INDEX `Breed_flockId_idx` ON `flocknerd_Breed` (`flockId`);--> statement-breakpoint
CREATE INDEX `EggLog_breedId_idx` ON `flocknerd_EggLog` (`breedId`);--> statement-breakpoint
CREATE INDEX `EggLog_flockId_idx` ON `flocknerd_EggLog` (`flockId`);--> statement-breakpoint
CREATE INDEX `Expense_flockId_idx` ON `flocknerd_Expense` (`flockId`);--> statement-breakpoint
CREATE INDEX `Flock_userId_idx` ON `flocknerd_Flock` (`userId`);--> statement-breakpoint
CREATE INDEX `Notification_userId_idx` ON `flocknerd_Notification` (`userId`);--> statement-breakpoint
CREATE INDEX `Session_userId_idx` ON `flocknerd_Session` (`userId`);--> statement-breakpoint
CREATE INDEX `Task_flockId_idx` ON `flocknerd_Task` (`flockId`);--> statement-breakpoint
CREATE INDEX `Task_userId_idx` ON `flocknerd_Task` (`userId`);--> statement-breakpoint
CREATE INDEX `User_clerkId_idx` ON `flocknerd_User` (`clerkId`);