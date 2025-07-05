# 🏁 Gokart Legends - Racing Management App

A comprehensive go-kart racing management application built with HTML, CSS, JavaScript, and PHP. Organize races, manage drivers, track statistics, and compete for the championship!

## 🌟 Features

### 🏎️ Core Racing Features
- **Track Management**: Add and manage go-kart tracks with details like location, type (indoor/outdoor), and pricing
- **Driver Profiles**: Create driver profiles with nicknames, bios, and comprehensive statistics
- **Race Organization**: Create races, propose dates, and manage participant voting
- **Statistics Tracking**: Track wins, podiums, fastest laps, and championship points
- **Leaderboard**: Real-time championship standings and driver rankings

### 🎨 User Experience
- **Formula 1 Theme**: Beautiful F1-inspired design with Hungarian language support
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization across all users
- **Offline Support**: Fallback to local storage when database is unavailable

### 🗄️ Database Backend
- **MySQL Database**: Robust data storage with proper relationships
- **PHP REST API**: Clean API endpoints for all CRUD operations
- **Data Migration**: Easy migration from localStorage to database
- **Backup & Sync**: Automatic data synchronization and backup

## 🚀 Getting Started

### Prerequisites
- Web hosting with PHP and MySQL support (cPanel recommended)
- Modern web browser
- Basic knowledge of cPanel/phpMyAdmin

### Quick Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/CyberShark1618/gokart.git
   cd gokart
   ```

2. **Database Setup**
   - Create MySQL database in cPanel
   - Import `database_schema.sql` via phpMyAdmin
   - Copy `config.example.php` to `config.php`
   - Update database credentials in `config.php`

3. **Upload Files**
   - Upload all files to your web server
   - Ensure proper file permissions (644 for most files)

4. **Test Installation**
   - Visit your domain to access the app
   - Test API endpoints: `/api.php/tracks`, `/api.php/drivers`, `/api.php/events`

### Local Development
```bash
# For local development with existing localStorage data
# Simply open gokart-racing.html in your browser
# Data will be stored locally until you set up the database
```

## 📖 Detailed Setup Guide

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive installation instructions including:
- Step-by-step cPanel database setup
- PHP configuration
- File upload instructions
- Troubleshooting guide
- Security considerations

## 🎯 How to Use

### 1. **Track Management**
- Navigate to the "Pályák" (Tracks) tab
- Add new tracks with name, address, type, and pricing
- Edit or delete existing tracks

### 2. **Driver Management**
- Go to "Versenyzők" (Drivers) tab
- Create driver profiles with names, nicknames, and bios
- View driver statistics and performance

### 3. **Race Organization**
- Visit "Versenyek" (Events) tab
- Create new races with track selection
- Propose dates for participant voting
- Manage race status from planning to completion

### 4. **Statistics & Leaderboard**
- Check "Bajnokság" (Championship) for overall standings
- View "Statisztikák" (Statistics) for personal performance
- Track wins, podiums, fastest laps, and points

## 📁 File Structure

```
gokart/
├── gokart-racing.html      # Main application file
├── gokart-styles.css       # All CSS styles
├── gokart-script.js        # Core JavaScript functionality
├── api-client.js           # API client for database communication
├── api.php                 # PHP REST API endpoints
├── config.example.php      # Configuration template
├── database.php            # Database connection class
├── database_schema.sql     # MySQL database structure
├── SETUP_GUIDE.md         # Detailed setup instructions
└── README_GOKART.md       # This file
```

## 🗄️ Database Schema

The application uses 7 main tables:
- **tracks**: Go-kart track information
- **drivers**: Driver profiles and information
- **driver_stats**: Driver performance statistics
- **events**: Race events and competitions
- **race_stats**: Individual race results
- **users**: User authentication (optional)
- **bug_reports**: Bug tracking system

## 🔧 API Endpoints

### Tracks
- `GET /api.php/tracks` - Get all tracks
- `POST /api.php/tracks` - Create new track
- `PUT /api.php/tracks/{id}` - Update track
- `DELETE /api.php/tracks/{id}` - Delete track

### Drivers
- `GET /api.php/drivers` - Get all drivers
- `POST /api.php/drivers` - Create new driver
- `PUT /api.php/drivers/{id}` - Update driver
- `DELETE /api.php/drivers/{id}` - Delete driver

### Events
- `GET /api.php/events` - Get all events
- `POST /api.php/events` - Create new event
- `PUT /api.php/events/{id}` - Update event
- `DELETE /api.php/events/{id}` - Delete event

## 🛠️ Development

### Local Development
1. Clone the repository
2. Open `gokart-racing.html` in your browser
3. Data will be stored in localStorage for testing

### Production Deployment
1. Set up MySQL database
2. Configure `config.php` with your credentials
3. Upload files to your web server
4. Import database schema
5. Test API endpoints

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Protection**: Using prepared statements
- **CORS Configuration**: Configurable allowed origins
- **Error Handling**: Proper error responses without exposing sensitive data
- **Configuration Security**: Sensitive config excluded from version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Formula 1 inspired design elements
- Hungarian go-kart racing community
- Open source web technologies

## 📞 Support

If you encounter any issues:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
2. Review the API endpoints documentation
3. Open an issue on GitHub

---

**🏁 Ready to race? Let's get started!** 🏁
