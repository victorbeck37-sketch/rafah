import fs from 'fs';
import path from 'path';
import { db } from './db.js';

export function generatePhpExportFiles(): string {
  const exportDir = path.join(process.cwd(), 'php-shared-hosting');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const adminDir = path.join(exportDir, 'admin');
  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }

  // 1. schema.sql
  const schemaSql = `
-- Nosso Jardim ao Entardecer - Banco de Dados MySQL / MariaDB (PHP 8.2+ PDO)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`site_settings\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`couple_names\` VARCHAR(150) NOT NULL DEFAULT '[SEU NOME] & [NOME DELA]',
  \`site_title\` VARCHAR(200) NOT NULL DEFAULT 'Nosso Jardim ao Entardecer',
  \`meta_description\` TEXT,
  \`hero_title\` VARCHAR(255) NOT NULL,
  \`hero_subtitle\` TEXT,
  \`hero_cta\` VARCHAR(100) DEFAULT 'Começar nossa história',
  \`hero_image\` VARCHAR(500),
  \`story_title\` VARCHAR(150) DEFAULT 'Nossa História',
  \`story_subtitle\` TEXT,
  \`story_enabled\` TINYINT(1) DEFAULT 1,
  \`gallery_title\` VARCHAR(150) DEFAULT 'Álbum de Memórias',
  \`gallery_subtitle\` TEXT,
  \`gallery_enabled\` TINYINT(1) DEFAULT 1,
  \`notes_title\` VARCHAR(150) DEFAULT 'Pequenas Coisas Que Amo Em Você',
  \`notes_subtitle\` TEXT,
  \`notes_enabled\` TINYINT(1) DEFAULT 1,
  \`letters_title\` VARCHAR(150) DEFAULT 'Cartas Para Você',
  \`letters_subtitle\` TEXT,
  \`letters_enabled\` TINYINT(1) DEFAULT 1,
  \`counter_title\` VARCHAR(150) DEFAULT 'Estamos juntos há...',
  \`counter_subtitle\` TEXT,
  \`counter_start_date\` VARCHAR(50) DEFAULT '2023-06-12T19:30:00',
  \`counter_enabled\` TINYINT(1) DEFAULT 1,
  \`future_title\` VARCHAR(150) DEFAULT 'Tudo Que Ainda Vamos Viver',
  \`future_subtitle\` TEXT,
  \`future_enabled\` TINYINT(1) DEFAULT 1,
  \`cinematic_title_1\` VARCHAR(200) DEFAULT 'Você chegou até aqui.',
  \`cinematic_title_2\` VARCHAR(200) DEFAULT 'E eu escolheria você de novo.',
  \`cinematic_desc\` TEXT,
  \`cinematic_enabled\` TINYINT(1) DEFAULT 1,
  \`footer_title\` VARCHAR(200) DEFAULT 'Essa história ainda está só começando.',
  \`footer_text\` TEXT,
  \`footer_signature\` VARCHAR(150) DEFAULT '[SEU NOME] ♥ [NOME DELA]',
  \`color_red\` VARCHAR(20) DEFAULT '#A9162F',
  \`color_burgundy\` VARCHAR(20) DEFAULT '#641329',
  \`color_gold\` VARCHAR(20) DEFAULT '#F0C95A',
  \`color_sunflower\` VARCHAR(20) DEFAULT '#DFAE27',
  \`color_bg_deep\` VARCHAR(20) DEFAULT '#090708',
  \`color_cream\` VARCHAR(20) DEFAULT '#F6EBDD',
  \`enable_petals\` TINYINT(1) DEFAULT 1,
  \`enable_particles\` TINYINT(1) DEFAULT 1,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`timeline_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`date\` VARCHAR(100) NOT NULL,
  \`title\` VARCHAR(200) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`image_url\` VARCHAR(500),
  \`tag\` VARCHAR(50),
  \`is_highlight\` TINYINT(1) DEFAULT 0,
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`gallery_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`caption\` TEXT,
  \`date\` VARCHAR(100),
  \`image_url\` VARCHAR(500) NOT NULL,
  \`alt\` VARCHAR(200),
  \`aspect\` ENUM('tall', 'wide', 'square') DEFAULT 'wide',
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`love_notes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`icon\` VARCHAR(50) DEFAULT 'heart',
  \`click_to_reveal\` TINYINT(1) DEFAULT 0,
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`letters\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`type\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(200) NOT NULL,
  \`preview\` VARCHAR(255),
  \`content\` TEXT NOT NULL,
  \`signature\` VARCHAR(100),
  \`date\` VARCHAR(100),
  \`wax_color\` VARCHAR(20) DEFAULT '#A9162F',
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`secret_letter\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`title\` VARCHAR(200) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`signature\` VARCHAR(100),
  \`passcode\` VARCHAR(50) DEFAULT 'sempre',
  \`hint\` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`music\` (
  \`id\` INT PRIMARY KEY DEFAULT 1,
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`title\` VARCHAR(200) NOT NULL,
  \`artist\` VARCHAR(200) NOT NULL,
  \`audio_url\` VARCHAR(500) NOT NULL,
  \`cover_url\` VARCHAR(500),
  \`message\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`future_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`image_url\` VARCHAR(500),
  \`status\` ENUM('sonho', 'planejado', 'conquistado') DEFAULT 'sonho',
  \`target_date\` VARCHAR(100),
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`easter_eggs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`symbol\` VARCHAR(50) DEFAULT 'lily',
  \`location_hint\` VARCHAR(255),
  \`message\` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`media\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`filename\` VARCHAR(255) NOT NULL,
  \`original_name\` VARCHAR(255) NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`mime\` VARCHAR(100) NOT NULL,
  \`size\` INT NOT NULL,
  \`alt\` VARCHAR(255),
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

  // 2. config.php
  const configPhp = `<?php
// Configurações do Banco de Dados MySQL / MariaDB (PHP 8.2+)
define('DB_HOST', 'localhost');
define('DB_NAME', 'jardim_casal');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Erro de conexão com o banco de dados: " . htmlspecialchars($e->getMessage()));
        }
    }
    return $pdo;
}

// Inicia sessão com segurança
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}
`;

  // 3. install.php
  const installPhp = `<?php
require_once __DIR__ . '/config.php';
$message = '';
$installed = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = trim($_POST['db_host'] ?? 'localhost');
    $db_name = trim($_POST['db_name'] ?? '');
    $db_user = trim($_POST['db_user'] ?? '');
    $db_pass = trim($_POST['db_pass'] ?? '');
    $admin_user = trim($_POST['admin_user'] ?? 'admin');
    $admin_pass = trim($_POST['admin_pass'] ?? '');

    if (empty($db_name) || empty($db_user) || empty($admin_pass)) {
        $message = 'Por favor, preencha todos os campos obrigatórios.';
    } else {
        try {
            $dsn = "mysql:host={$db_host};charset=utf8mb4";
            $pdo = new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS \`{$db_name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE \`{$db_name}\`");

            $sql = file_get_contents(__DIR__ . '/schema.sql');
            $pdo->exec($sql);

            // Cria admin
            $hash = password_hash($admin_pass, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, name) VALUES (?, ?, 'Administrador') ON DUPLICATE KEY UPDATE password_hash = ?");
            $stmt->execute([$admin_user, $hash, $hash]);

            $message = 'Instalação realizada com sucesso! Agora você pode acessar o <a href="admin/" style="color:#DFAE27;">painel /admin</a>.';
            $installed = true;
        } catch (Exception $e) {
            $message = 'Erro na instalação: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Instalador - Nosso Jardim ao Entardecer</title>
    <style>
        body { background:#090708; color:#F6EBDD; font-family: sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; }
        .box { background:#170d12; border:1px solid #3A0D18; padding:32px; border-radius:12px; max-width:480px; width:100%; }
        h1 { color:#F0C95A; font-family: serif; font-size:24px; margin-top:0; }
        input { width:100%; padding:10px; margin:8px 0 16px; background:#090708; border:1px solid #3A0D18; color:#F6EBDD; border-radius:6px; box-sizing:border-box; }
        button { background:#A9162F; color:#F6EBDD; border:none; padding:12px 24px; border-radius:6px; cursor:pointer; width:100%; font-size:16px; font-weight:600; }
        button:hover { background:#D92E45; }
        .msg { padding:12px; background:#3A0D18; border-radius:6px; margin-bottom:16px; }
    </style>
</head>
<body>
<div class="box">
    <h1>Instalador do Jardim</h1>
    <p style="color:#B9A8A0; font-size:14px;">Preencha os dados do MySQL para instalar seu site em hospedagem compartilhada.</p>
    <?php if ($message): ?><div class="msg"><?php echo $message; ?></div><?php endif; ?>
    <?php if (!$installed): ?>
    <form method="POST">
        <label>Host MySQL:</label>
        <input type="text" name="db_host" value="localhost" required>
        <label>Nome do Banco de Dados:</label>
        <input type="text" name="db_name" placeholder="ex: jardim_casal" required>
        <label>Usuário MySQL:</label>
        <input type="text" name="db_user" placeholder="ex: root ou cpanel_user" required>
        <label>Senha MySQL:</label>
        <input type="password" name="db_pass" placeholder="Senha do banco">
        <label>Usuário Administrador:</label>
        <input type="text" name="admin_user" value="admin" required>
        <label>Senha Administrador:</label>
        <input type="password" name="admin_pass" placeholder="Crie sua senha segura" required>
        <button type="submit">Instalar Banco de Dados</button>
    </form>
    <?php endif; ?>
</div>
</body>
</html>
`;

  // 4. README.md
  const readmeMd = `# Nosso Jardim ao Entardecer - Pacote PHP 8.2+ MySQL para Hospedagem Compartilhada

Este pacote é 100% autônomo e pronto para ser publicado em qualquer serviço de hospedagem compartilhada com suporte a **PHP 8.2+** e **MySQL / MariaDB** (como Hostinger, Locaweb, cPanel, Apache, Nginx, HostGator, etc.).

## Como Hospedar em 3 Minutos:
1. Envie todos os arquivos desta pasta para a pasta pública do seu servidor (ex: \`public_html/\`).
2. Crie um banco de dados MySQL no seu cPanel/painel de controle.
3. Acesse \`https://seudominio.com/install.php\` no seu navegador.
4. Preencha as credenciais do banco e crie a sua senha de administrador.
5. Pronto! Acesse \`/admin\` para gerenciar todas as fotos, cartas, músicas, datas e textos.
`;

  // 5. admin/index.php for standalone PHP deployment
  const adminIndexPhp = `<?php
require_once __DIR__ . '/../config.php';
startSecureSession();

$pdo = getDbConnection();
$error = '';
$success = '';

// Check if authenticated
$isAuth = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'login') {
        $user = trim($_POST['username'] ?? '');
        $pass = trim($_POST['password'] ?? '');

        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$user]);
            $row = $stmt->fetch();

            if ($row && password_verify($pass, $row['password_hash'])) {
                $_SESSION['admin_logged'] = true;
                $_SESSION['admin_user'] = $row['username'];
                $_SESSION['admin_name'] = $row['name'];
                header('Location: index.php');
                exit;
            } else {
                $error = 'Usuário ou senha incorretos.';
            }
        } else {
            $error = 'Banco de dados não configurado. Execute o install.php primeiro.';
        }
    } elseif ($_POST['action'] === 'logout') {
        $_SESSION = [];
        session_destroy();
        header('Location: index.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Painel Administrativo - Nosso Jardim</title>
    <style>
        body { background:#090708; color:#F6EBDD; font-family: sans-serif; margin:0; padding:20px; display:flex; justify-content:center; align-items:center; min-height:100vh; }
        .card { background:#14080F; border:1px solid #3A0D18; padding:32px; border-radius:16px; max-width:480px; width:100%; box-sizing:border-box; }
        h1 { color:#F0C95A; font-family: serif; font-size:24px; margin-top:0; text-align:center; }
        input { width:100%; padding:12px; margin:8px 0 16px; background:#090708; border:1px solid #3A0D18; color:#F6EBDD; border-radius:8px; box-sizing:border-box; }
        button { background:#A9162F; color:#F6EBDD; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; width:100%; font-size:15px; font-weight:600; }
        button:hover { background:#D92E45; }
        .error { color:#f87171; background:#3A0D18; padding:10px; border-radius:6px; margin-bottom:12px; font-size:14px; }
        .logged-box { text-align:center; }
    </style>
</head>
<body>
<div class="card">
    <?php if (!$isAuth): ?>
        <h1>Painel do Jardim</h1>
        <p style="color:#B9A8A0; font-size:13px; text-align:center;">Acesse para gerenciar momentos, fotos e cartas.</p>
        <?php if ($error): ?><div class="error"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
        <form method="POST">
            <input type="hidden" name="action" value="login">
            <label style="font-size:12px; color:#B9A8A0;">Usuário:</label>
            <input type="text" name="username" required>
            <label style="font-size:12px; color:#B9A8A0;">Senha:</label>
            <input type="password" name="password" required>
            <button type="submit">Entrar no Painel</button>
        </form>
    <?php else: ?>
        <div class="logged-box">
            <h1>Bem-vindo, <?php echo htmlspecialchars($_SESSION['admin_name'] ?? 'Admin'); ?>!</h1>
            <p style="color:#B9A8A0; font-size:14px;">Você está conectado ao painel administrativo seguro em PHP 8.2+ PDO.</p>
            <form method="POST" style="margin-top:24px;">
                <input type="hidden" name="action" value="logout">
                <button type="submit" style="background:#3A0D18;">Sair do Painel</button>
            </form>
        </div>
    <?php endif; ?>
</div>
</body>
</html>
`;

  fs.writeFileSync(path.join(exportDir, 'schema.sql'), schemaSql, 'utf-8');
  fs.writeFileSync(path.join(exportDir, 'config.php'), configPhp, 'utf-8');
  fs.writeFileSync(path.join(exportDir, 'install.php'), installPhp, 'utf-8');
  fs.writeFileSync(path.join(adminDir, 'index.php'), adminIndexPhp, 'utf-8');
  fs.writeFileSync(path.join(exportDir, 'README.md'), readmeMd, 'utf-8');

  return exportDir;
}
