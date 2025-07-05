// API Client for Go-Kart Racing App
// Replace localStorage with PHP API calls

class GoKartAPIClient {
    constructor(baseURL = '/api.php') {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Cache management
    getCacheKey(endpoint, params = {}) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Generic CRUD operations
    async getAll(resource) {
        const cacheKey = this.getCacheKey(resource);
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        const data = await this.request(resource);
        this.setCache(cacheKey, data);
        return data;
    }

    async getById(resource, id) {
        const cacheKey = this.getCacheKey(`${resource}_${id}`);
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        const data = await this.request(`${resource}/${id}`);
        this.setCache(cacheKey, data);
        return data;
    }

    async create(resource, data) {
        const result = await this.request(resource, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        
        // Clear cache for this resource
        this.clearCache(resource);
        return result;
    }

    async update(resource, id, data) {
        const result = await this.request(`${resource}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        
        // Clear cache for this resource
        this.clearCache(resource);
        return result;
    }

    async delete(resource, id) {
        const result = await this.request(`${resource}/${id}`, {
            method: 'DELETE',
        });
        
        // Clear cache for this resource
        this.clearCache(resource);
        return result;
    }

    // Specific methods for your app
    async getAllTracks() {
        return this.getAll('tracks');
    }

    async createTrack(trackData) {
        return this.create('tracks', trackData);
    }

    async updateTrack(id, trackData) {
        return this.update('tracks', id, trackData);
    }

    async deleteTrack(id) {
        return this.delete('tracks', id);
    }

    async getAllDrivers() {
        return this.getAll('drivers');
    }

    async createDriver(driverData) {
        return this.create('drivers', driverData);
    }

    async updateDriver(id, driverData) {
        return this.update('drivers', id, driverData);
    }

    async deleteDriver(id) {
        return this.delete('drivers', id);
    }

    async getAllEvents() {
        return this.getAll('events');
    }

    async createEvent(eventData) {
        return this.create('events', eventData);
    }

    async updateEvent(id, eventData) {
        return this.update('events', id, eventData);
    }

    async deleteEvent(id) {
        return this.delete('events', id);
    }

    // Migration helper - move localStorage data to database
    async migrateFromLocalStorage() {
        try {
            console.log('Starting migration from localStorage to database...');
            
            // Migrate tracks
            const localTracks = JSON.parse(localStorage.getItem('goKartTracks') || '[]');
            for (const track of localTracks) {
                try {
                    await this.createTrack(track);
                    console.log(`Migrated track: ${track.name}`);
                } catch (error) {
                    console.error(`Failed to migrate track ${track.name}:`, error);
                }
            }

            // Migrate drivers
            const localDrivers = JSON.parse(localStorage.getItem('goKartDrivers') || '[]');
            for (const driver of localDrivers) {
                try {
                    await this.createDriver(driver);
                    console.log(`Migrated driver: ${driver.name}`);
                } catch (error) {
                    console.error(`Failed to migrate driver ${driver.name}:`, error);
                }
            }

            // Migrate events
            const localEvents = JSON.parse(localStorage.getItem('goKartEvents') || '[]');
            for (const event of localEvents) {
                try {
                    await this.createEvent(event);
                    console.log(`Migrated event: ${event.title}`);
                } catch (error) {
                    console.error(`Failed to migrate event ${event.title}:`, error);
                }
            }

            console.log('Migration completed successfully!');
            
            // Optionally backup localStorage data before clearing
            const backup = {
                tracks: localTracks,
                drivers: localDrivers,
                events: localEvents,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('goKartBackup', JSON.stringify(backup));
            
            // Clear localStorage after successful migration
            localStorage.removeItem('goKartTracks');
            localStorage.removeItem('goKartDrivers');
            localStorage.removeItem('goKartEvents');
            
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    // Offline support - fallback to localStorage when API is unavailable
    async getAllTracksWithFallback() {
        try {
            return await this.getAllTracks();
        } catch (error) {
            console.warn('API unavailable, falling back to localStorage');
            return JSON.parse(localStorage.getItem('goKartTracks') || '[]');
        }
    }

    async getAllDriversWithFallback() {
        try {
            return await this.getAllDrivers();
        } catch (error) {
            console.warn('API unavailable, falling back to localStorage');
            return JSON.parse(localStorage.getItem('goKartDrivers') || '[]');
        }
    }

    async getAllEventsWithFallback() {
        try {
            return await this.getAllEvents();
        } catch (error) {
            console.warn('API unavailable, falling back to localStorage');
            return JSON.parse(localStorage.getItem('goKartEvents') || '[]');
        }
    }

    // Sync localStorage with database (for offline support)
    async syncToLocalStorage() {
        try {
            const [tracks, drivers, events] = await Promise.all([
                this.getAllTracks(),
                this.getAllDrivers(),
                this.getAllEvents()
            ]);

            localStorage.setItem('goKartTracks', JSON.stringify(tracks));
            localStorage.setItem('goKartDrivers', JSON.stringify(drivers));
            localStorage.setItem('goKartEvents', JSON.stringify(events));
            localStorage.setItem('lastSync', new Date().toISOString());

            console.log('Data synced to localStorage');
        } catch (error) {
            console.error('Failed to sync to localStorage:', error);
        }
    }

    // Check if we're online and API is available
    async isOnline() {
        try {
            await this.request('tracks?limit=1');
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Initialize the API client
const apiClient = new GoKartAPIClient();

// Export for global use
window.apiClient = apiClient;

// Auto-sync every 5 minutes when online
setInterval(async () => {
    if (await apiClient.isOnline()) {
        await apiClient.syncToLocalStorage();
    }
}, 5 * 60 * 1000);
