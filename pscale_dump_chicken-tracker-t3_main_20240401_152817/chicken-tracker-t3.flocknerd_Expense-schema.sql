CREATE TABLE `flocknerd_Expense` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `date` date NOT NULL,
  `memo` text COLLATE utf8mb4_unicode_ci,
  `flockId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  PRIMARY KEY (`id`),
  KEY `Expense_flockId_idx` (`flockId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
