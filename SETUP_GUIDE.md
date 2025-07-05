# 🏁 Go-Kart Racing App - Database Setup Guide

This guide will help you set up your Go-Kart Racing app with a PHP backend and MySQL database using cPanel.

## 📋 Prerequisites

- cPanel hosting account with PHP and MySQL support
- Access to phpMyAdmin or MySQL database management
- FTP/File Manager access to upload files

## 🗄️ Step 1: Create MySQL Database

### In cPanel:

1. **Go to MySQL Databases**
   - Find "MySQL Databases" in cPanel
   - Click on it

2. **Create New Database**
   - Database Name: `gokart_racing` (or your preferred name)
   - Click "Create Database"

3. **Create Database User**
   - Username: `gokart_user` (or your preferred username)
   - Password: Create a strong password
   - Click "Create User"

4. **Add User to Database**
   - Select the user and database you just created
   - Grant "ALL PRIVILEGES"
   - Click "Make Changes"

5. **Note Your Database Details**
   ```
   Database Host: localhost
   Database Name: yourusername_gokart_racing
   Database User: yourusername_gokart_user
   Database Password: [your password]
   ```

## 🏗️ Step 2: Import Database Schema

### Using phpMyAdmin:

1. **Open phpMyAdmin** from cPanel
2. **Select your database** from the left sidebar
3. **Click "Import" tab**
4. **Choose file**: Upload `database_schema.sql`
5. **Click "Go"** to execute

### Alternative - Manual SQL:

1. **Click "SQL" tab** in phpMyAdmin
2. **Copy and paste** the contents of `database_schema.sql`
3. **Click "Go"** to execute

## ⚙️ Step 3: Configure PHP Files

### Update config.php:

```php
// Update these values with your actual database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'yourusername_gokart_racing'); // Your actual database name
define('DB_USER', 'yourusername_gokart_user');   // Your actual username
define('DB_PASS', 'your_actual_password');       // Your actual password

// Update with your domain
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]);
```

## 📁 Step 4: Upload Files to Server

### Upload these files to your web directory:

```
public_html/
├── gokart-racing.html
├── gokart-styles.css
├── gokart-script.js
├── api-client.js
├── api.php
├── config.php
├── database.php
└── database_schema.sql (optional, for backup)
```

### File Permissions:
- HTML, CSS, JS files: 644
- PHP files: 644
- Make sure your web server can read all files

## 🔧 Step 5: Test the Setup

### 1. Test Database Connection:

Create a test file `test_db.php`:

```php
<?php
require_once 'config.php';
require_once 'database.php';

try {
    $db = getDB();
    $tracks = $db->fetchAll("SELECT COUNT(*) as count FROM tracks");
    echo "✅ Database connection successful!<br>";
    echo "Tracks in database: " . $tracks[0]['count'];
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage();
}
?>
```

### 2. Test API Endpoints:

Visit these URLs in your browser:
- `https://yourdomain.com/api.php/tracks` - Should return JSON
- `https://yourdomain.com/api.php/drivers` - Should return JSON
- `https://yourdomain.com/api.php/events` - Should return JSON

### 3. Test Frontend:

Visit `https://yourdomain.com/gokart-racing.html`

## 🔄 Step 6: Migrate Existing Data (Optional)

If you have existing data in localStorage:

### Option 1: Automatic Migration

1. Open your app in the browser
2. Open browser console (F12)
3. Run: `apiClient.migrateFromLocalStorage()`

### Option 2: Manual Migration

1. Export localStorage data:
   ```javascript
   console.log('Tracks:', localStorage.getItem('goKartTracks'));
   console.log('Drivers:', localStorage.getItem('goKartDrivers'));
   console.log('Events:', localStorage.getItem('goKartEvents'));
   ```

2. Copy the data and manually insert into database via phpMyAdmin

## 🛠️ Troubleshooting

### Common Issues:

**1. Database Connection Failed**
- Check database credentials in `config.php`
- Verify database user has correct privileges
- Check if database name includes your cPanel username prefix

**2. API Returns 500 Error**
- Check PHP error logs in cPanel
- Verify all PHP files are uploaded correctly
- Check file permissions

**3. CORS Errors**
- Update `ALLOWED_ORIGINS` in `config.php`
- Make sure your domain is included

**4. API Not Found (404)**
- Check if `api.php` is in the correct directory
- Verify your web server supports URL rewriting
- Try accessing `api.php` directly

### Enable Debug Mode:

In `config.php`, temporarily set:
```php
define('DEBUG_MODE', true);
```

This will show detailed error messages. **Remember to set it back to `false` in production!**

## 🔒 Security Considerations

1. **Change Default Passwords**: Use strong, unique passwords
2. **Update JWT Secret**: Change the JWT_SECRET in config.php
3. **Disable Debug Mode**: Set DEBUG_MODE to false in production
4. **Regular Backups**: Backup your database regularly
5. **Update PHP**: Keep your PHP version updated

## 📊 Database Structure

Your database will have these tables:
- `tracks` - Go-kart track information
- `drivers` - Driver profiles
- `driver_stats` - Driver statistics
- `events` - Race events
- `race_stats` - Individual race results
- `users` - User authentication
- `bug_reports` - Bug tracking

## 🚀 Next Steps

1. **Test all functionality** in your app
2. **Add authentication** if needed
3. **Set up regular backups**
4. **Monitor performance**
5. **Add more features** as needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review PHP error logs in cPanel
3. Test API endpoints individually
4. Verify database connection

---

**🎉 Congratulations!** Your Go-Kart Racing app now uses a proper database backend!
