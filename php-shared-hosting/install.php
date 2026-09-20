<?php
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
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$db_name}`");

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
