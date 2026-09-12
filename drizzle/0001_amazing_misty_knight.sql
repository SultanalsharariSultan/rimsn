CREATE TABLE `player_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(120) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`nameEn` varchar(160),
	`country` varchar(100) NOT NULL,
	`club` varchar(160),
	`position` varchar(60),
	`jerseyNumber` int,
	`imageUrl` text,
	`bio` text,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `player_profiles_slug_unique` UNIQUE(`slug`)
);
