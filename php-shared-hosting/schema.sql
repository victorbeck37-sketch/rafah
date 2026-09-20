
-- Nosso Jardim ao Entardecer - Banco de Dados MySQL / MariaDB (PHP 8.2+ PDO)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `couple_names` VARCHAR(150) NOT NULL DEFAULT '[SEU NOME] & [NOME DELA]',
  `site_title` VARCHAR(200) NOT NULL DEFAULT 'Nosso Jardim ao Entardecer',
  `meta_description` TEXT,
  `hero_title` VARCHAR(255) NOT NULL,
  `hero_subtitle` TEXT,
  `hero_cta` VARCHAR(100) DEFAULT 'Começar nossa história',
  `hero_image` VARCHAR(500),
  `story_title` VARCHAR(150) DEFAULT 'Nossa História',
  `story_subtitle` TEXT,
  `story_enabled` TINYINT(1) DEFAULT 1,
  `gallery_title` VARCHAR(150) DEFAULT 'Álbum de Memórias',
  `gallery_subtitle` TEXT,
  `gallery_enabled` TINYINT(1) DEFAULT 1,
  `notes_title` VARCHAR(150) DEFAULT 'Pequenas Coisas Que Amo Em Você',
  `notes_subtitle` TEXT,
  `notes_enabled` TINYINT(1) DEFAULT 1,
  `letters_title` VARCHAR(150) DEFAULT 'Cartas Para Você',
  `letters_subtitle` TEXT,
  `letters_enabled` TINYINT(1) DEFAULT 1,
  `counter_title` VARCHAR(150) DEFAULT 'Estamos juntos há...',
  `counter_subtitle` TEXT,
  `counter_start_date` VARCHAR(50) DEFAULT '2023-06-12T19:30:00',
  `counter_enabled` TINYINT(1) DEFAULT 1,
  `future_title` VARCHAR(150) DEFAULT 'Tudo Que Ainda Vamos Viver',
  `future_subtitle` TEXT,
  `future_enabled` TINYINT(1) DEFAULT 1,
  `cinematic_title_1` VARCHAR(200) DEFAULT 'Você chegou até aqui.',
  `cinematic_title_2` VARCHAR(200) DEFAULT 'E eu escolheria você de novo.',
  `cinematic_desc` TEXT,
  `cinematic_enabled` TINYINT(1) DEFAULT 1,
  `footer_title` VARCHAR(200) DEFAULT 'Essa história ainda está só começando.',
  `footer_text` TEXT,
  `footer_signature` VARCHAR(150) DEFAULT '[SEU NOME] ♥ [NOME DELA]',
  `color_red` VARCHAR(20) DEFAULT '#A9162F',
  `color_burgundy` VARCHAR(20) DEFAULT '#641329',
  `color_gold` VARCHAR(20) DEFAULT '#F0C95A',
  `color_sunflower` VARCHAR(20) DEFAULT '#DFAE27',
  `color_bg_deep` VARCHAR(20) DEFAULT '#090708',
  `color_cream` VARCHAR(20) DEFAULT '#F6EBDD',
  `enable_petals` TINYINT(1) DEFAULT 1,
  `enable_particles` TINYINT(1) DEFAULT 1,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `timeline_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` VARCHAR(100) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500),
  `tag` VARCHAR(50),
  `is_highlight` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `caption` TEXT,
  `date` VARCHAR(100),
  `image_url` VARCHAR(500) NOT NULL,
  `alt` VARCHAR(200),
  `aspect` ENUM('tall', 'wide', 'square') DEFAULT 'wide',
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `love_notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `icon` VARCHAR(50) DEFAULT 'heart',
  `click_to_reveal` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `letters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `preview` VARCHAR(255),
  `content` TEXT NOT NULL,
  `signature` VARCHAR(100),
  `date` VARCHAR(100),
  `wax_color` VARCHAR(20) DEFAULT '#A9162F',
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `secret_letter` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `signature` VARCHAR(100),
  `passcode` VARCHAR(50) DEFAULT 'sempre',
  `hint` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `music` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `title` VARCHAR(200) NOT NULL,
  `artist` VARCHAR(200) NOT NULL,
  `audio_url` VARCHAR(500) NOT NULL,
  `cover_url` VARCHAR(500),
  `message` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `future_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500),
  `status` ENUM('sonho', 'planejado', 'conquistado') DEFAULT 'sonho',
  `target_date` VARCHAR(100),
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `easter_eggs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `symbol` VARCHAR(50) DEFAULT 'lily',
  `location_hint` VARCHAR(255),
  `message` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `mime` VARCHAR(100) NOT NULL,
  `size` INT NOT NULL,
  `alt` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
