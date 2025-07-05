#!/bin/bash

# Go-Kart Racing App Deployment Script
# This script helps deploy your app to your web hosting

echo "🏁 Go-Kart Racing App Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if config.php exists
if [ ! -f "config.php" ]; then
    print_warning "config.php not found!"
    print_info "Creating config.php from template..."
    
    if [ -f "config.example.php" ]; then
        cp config.example.php config.php
        print_status "config.php created from template"
        print_warning "Please edit config.php with your database credentials before deploying!"
        echo ""
        echo "You need to update these values in config.php:"
        echo "- DB_HOST (usually 'localhost')"
        echo "- DB_NAME (your database name)"
        echo "- DB_USER (your database username)"
        echo "- DB_PASS (your database password)"
        echo "- ALLOWED_ORIGINS (your domain)"
        echo ""
        read -p "Press Enter when you've updated config.php..."
    else
        print_error "config.example.php not found!"
        exit 1
    fi
fi

# List of files to deploy
FILES=(
    "gokart-racing.html"
    "gokart-styles.css"
    "gokart-script.js"
    "api-client.js"
    "api.php"
    "config.php"
    "database.php"
)

echo ""
print_info "Files to deploy:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""
print_info "Database setup files:"
if [ -f "database_schema.sql" ]; then
    echo "  ✅ database_schema.sql (import this to your MySQL database)"
else
    echo "  ❌ database_schema.sql (missing)"
fi

echo ""
print_info "Documentation:"
if [ -f "SETUP_GUIDE.md" ]; then
    echo "  ✅ SETUP_GUIDE.md (detailed setup instructions)"
else
    echo "  ❌ SETUP_GUIDE.md (missing)"
fi

echo ""
echo "🚀 Deployment Checklist:"
echo "========================"
echo ""
echo "1. Database Setup:"
echo "   □ Create MySQL database in cPanel"
echo "   □ Import database_schema.sql via phpMyAdmin"
echo "   □ Note your database credentials"
echo ""
echo "2. Configuration:"
echo "   □ Update config.php with your database credentials"
echo "   □ Update ALLOWED_ORIGINS with your domain"
echo "   □ Set DEBUG_MODE to false for production"
echo ""
echo "3. File Upload:"
echo "   □ Upload all files to your web server"
echo "   □ Set file permissions to 644"
echo "   □ Ensure your web server can read all files"
echo ""
echo "4. Testing:"
echo "   □ Visit your domain to test the app"
echo "   □ Test API endpoints: /api.php/tracks"
echo "   □ Check browser console for errors"
echo ""
echo "5. Migration (if you have existing data):"
echo "   □ Open browser console on your app"
echo "   □ Run: apiClient.migrateFromLocalStorage()"
echo ""

print_info "For detailed instructions, see SETUP_GUIDE.md"
print_status "Deployment preparation complete!"

echo ""
echo "🔗 Useful Links:"
echo "================"
echo "• GitHub Repository: https://github.com/CyberShark1618/gokart"
echo "• Setup Guide: See SETUP_GUIDE.md"
echo "• API Documentation: See README_GOKART.md"

echo ""
print_status "Ready to deploy! 🏁"
