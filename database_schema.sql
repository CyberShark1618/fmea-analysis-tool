-- Go-Kart Racing App Database Schema
-- Run this in your cPanel phpMyAdmin or MySQL interface

-- Create database (if not already created in cPanel)
-- CREATE DATABASE gokart_racing;
-- USE gokart_racing;

-- Tracks table
CREATE TABLE tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    type ENUM('inside', 'outside') NOT NULL,
    price_per_person INT NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    bio TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Driver statistics table (separate for better normalization)
CREATE TABLE driver_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    races INT DEFAULT 0,
    wins INT DEFAULT 0,
    podiums INT DEFAULT 0,
    fastest_laps INT DEFAULT 0,
    points INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    track_id INT,
    status ENUM('planning', 'voting', 'date-selected', 'to-be-booked', 'booked', 'race-awaiting', 'done', 'cancelled') DEFAULT 'planning',
    proposed_dates JSON,
    votes JSON,
    participants JSON,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL
);

-- Race statistics table
CREATE TABLE race_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    driver_id INT NOT NULL,
    position INT,
    lap_time DECIMAL(8,3),
    best_lap DECIMAL(8,3),
    total_time DECIMAL(10,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_driver (event_id, driver_id)
);

-- Users table (for authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    driver_id INT,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Bug reports table
CREATE TABLE bug_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    steps TEXT,
    reported_by VARCHAR(255),
    status ENUM('open', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial driver stats for existing drivers (trigger)
DELIMITER //
CREATE TRIGGER create_driver_stats 
    AFTER INSERT ON drivers 
    FOR EACH ROW 
BEGIN
    INSERT INTO driver_stats (driver_id) VALUES (NEW.id);
END//
DELIMITER ;

-- Sample data (optional)
INSERT INTO tracks (name, address, type, price_per_person, description, created_by) VALUES
('Budapest Karting', 'Budapest, Váci út 1-3', 'inside', 5000, 'Modern beltéri pálya a fővárosban', 'Admin'),
('Hungaroring Kart', 'Mogyoród, Hungaroring', 'outside', 6000, 'A Forma-1 pálya melletti go-kart pálya', 'Admin'),
('Balaton Ring', 'Balatonfűzfő, Ring utca 1', 'outside', 4500, 'Gyönyörű kilátással a Balatonra', 'Admin');

INSERT INTO drivers (name, nickname, bio, created_by) VALUES
('Kovács János', 'Speedy', 'Tapasztalt versenyző, 5 éve kart-ozik', 'Admin'),
('Nagy Péter', 'Thunder', 'Kezdő, de nagyon lelkes versenyző', 'Admin'),
('Szabó Anna', 'Lightning', 'A csapat egyetlen női versenyzője', 'Admin');

-- Update driver stats for sample drivers
UPDATE driver_stats SET races = 15, wins = 3, podiums = 8, fastest_laps = 2, points = 145 WHERE driver_id = 1;
UPDATE driver_stats SET races = 8, wins = 1, podiums = 3, fastest_laps = 1, points = 78 WHERE driver_id = 2;
UPDATE driver_stats SET races = 12, wins = 4, podiums = 9, fastest_laps = 3, points = 167 WHERE driver_id = 3;
