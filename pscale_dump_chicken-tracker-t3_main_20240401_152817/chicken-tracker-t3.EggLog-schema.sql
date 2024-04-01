CREATE TABLE `EggLog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `count` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `date` datetime(3) NOT NULL,
  `flockId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `breedId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EggLog_flockId_idx` (`flockId`),
  KEY `EggLog_breedId_idx` (`breedId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
