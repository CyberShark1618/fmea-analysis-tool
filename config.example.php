<?php
// Database Configuration Template for Go-Kart Racing App
// Copy this file to config.php and update with your actual database credentials

// Database connection settings
define('DB_HOST', 'localhost'); // Usually 'localhost' in cPanel
define('DB_NAME', 'your_database_name'); // Your database name from cPanel
define('DB_USER', 'your_database_user'); // Your database username
define('DB_PASS', 'your_database_password'); // Your database password
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'Gokart Legends');
define('APP_VERSION', '1.0.0');
define('DEBUG_MODE', false); // Set to false in production

// CORS settings (adjust as needed)
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://127.0.0.1',
    'https://yourdomain.com', // Replace with your actual domain
    'https://www.yourdomain.com'
]);

// API settings
define('API_VERSION', 'v1');
define('MAX_RESULTS_PER_PAGE', 100);

// Security settings
define('JWT_SECRET', 'your-secret-key-here-change-this'); // Change this to a random string
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Europe/Budapest');
?>
