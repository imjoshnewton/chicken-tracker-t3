CREATE TABLE `flocknerd_Breed` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `count` smallint NOT NULL,
  `imageUrl` text COLLATE utf8mb4_unicode_ci,
  `averageProduction` double NOT NULL,
  `flockId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `breed` text COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (_utf8mb4''),
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `Breed_flockId_idx` (`flockId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
