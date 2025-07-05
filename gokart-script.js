// Global variables
let currentUser = null;
let isRegisterMode = false;
let tracks = JSON.parse(localStorage.getItem('goKartTracks') || '[]');
let drivers = JSON.parse(localStorage.getItem('goKartDrivers') || '[]');
let events = JSON.parse(localStorage.getItem('goKartEvents') || '[]');
let users = JSON.parse(localStorage.getItem('goKartUsers') || '[]');
let races = JSON.parse(localStorage.getItem('goKartRaces') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateDashboardStats();
    loadUpcomingEvents();
});

// Authentication functions
function checkAuth() {
    const savedUser = localStorage.getItem('currentGoKartUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserInterface();
    }
    showApp();
}

function updateUserInterface() {
    if (currentUser) {
        const displayName = currentUser.nickname ?
            `${currentUser.nickname}` :
            currentUser.username;
        document.getElementById('welcomeUser').textContent = `Üdv, ${displayName}!`;
        document.getElementById('welcomeUser').classList.remove('hidden');
        document.getElementById('loginBtn').classList.add('hidden');
        document.getElementById('logoutBtn').classList.remove('hidden');
    } else {
        document.getElementById('welcomeUser').classList.add('hidden');
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('logoutBtn').classList.add('hidden');
    }
}

function showQuickLogin() {
    populateDriverSelection();
    document.getElementById('quickLoginModal').style.display = 'block';
}

function populateDriverSelection() {
    const driverList = document.getElementById('driverSelectionList');

    if (drivers.length === 0) {
        driverList.innerHTML = '<p style="text-align: center; color: #666;">Még nincsenek versenyzők. Hozz létre egyet!</p>';
        return;
    }

    driverList.innerHTML = drivers.map(driver => `
        <div class="driver-selection-card" onclick="selectDriver(${driver.id})" style="
            background: rgba(225, 6, 0, 0.1);
            border: 2px solid rgba(225, 6, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s ease;
        " onmouseover="this.style.borderColor='var(--f1-red)'; this.style.background='rgba(225, 6, 0, 0.2)'"
           onmouseout="this.style.borderColor='rgba(225, 6, 0, 0.3)'; this.style.background='rgba(225, 6, 0, 0.1)'">
            <h4 style="margin: 0 0 5px 0; color: var(--f1-red);">👤 ${driver.name}</h4>
            ${driver.nickname ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px; font-weight: 600;">"${driver.nickname}"</p>` : ''}
            <div style="font-size: 12px; color: #888;">
                Futamok: ${driver.stats.races} | Győzelmek: ${driver.stats.wins} | Pontok: ${driver.stats.points}
            </div>
        </div>
    `).join('');
}

function selectDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
        currentUser = {
            driverId: driver.id,
            username: driver.name,
            nickname: driver.nickname,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('currentGoKartUser', JSON.stringify(currentUser));
        updateUserInterface();
        closeModal('quickLoginModal');

        // Execute pending callback if exists
        if (window.pendingCallback) {
            window.pendingCallback();
            window.pendingCallback = null;
        }
    }
}

function showAddDriverInLogin() {
    document.getElementById('addDriverForm').style.display = 'block';
}

function hideAddDriverInLogin() {
    document.getElementById('addDriverForm').style.display = 'none';
    document.getElementById('newDriverForm').reset();
}

function logout() {
    localStorage.removeItem('currentGoKartUser');
    currentUser = null;
    updateUserInterface();
}

function requireAuth(callback, message = 'Ez a funkció bejelentkezést igényel.') {
    if (!currentUser) {
        if (confirm(message + ' Szeretnél bejelentkezni?')) {
            showQuickLogin();
            // Store the callback to execute after login
            window.pendingCallback = callback;
        }
        return false;
    }
    return true;
}

function showApp() {
    loadAllData();
}

// Tab navigation
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to the corresponding nav tab
    const navTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (navTab) {
        navTab.classList.add('active');
    }
    
    // Load data for specific tabs
    if (tabName === 'tracks') loadTracks();
    if (tabName === 'drivers') loadDrivers();
    if (tabName === 'events') loadEvents();
    if (tabName === 'leaderboard') loadLeaderboard();
    if (tabName === 'profile') loadProfile();
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load all data
function loadAllData() {
    loadTracks();
    loadDrivers();
    loadEvents();
    loadLeaderboard();
    updateDashboardStats();
    loadUpcomingEvents();
}

// Dashboard functions
function updateDashboardStats() {
    document.getElementById('totalEvents').textContent = events.length;
    document.getElementById('totalDrivers').textContent = drivers.length;
    document.getElementById('totalTracks').textContent = tracks.length;
}

function loadUpcomingEvents() {
    const upcomingContainer = document.getElementById('upcomingEvents');

    // Filter events with future dates and sort by priority (planning first, then by creation date)
    const upcoming = events.filter(event => {
        return event.proposedDates && event.proposedDates.some(date => new Date(date) > new Date());
    }).sort((a, b) => {
        // Prioritize planning races first
        if (a.status === 'planning' && b.status !== 'planning') return -1;
        if (b.status === 'planning' && a.status !== 'planning') return 1;
        // Then sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 4); // Show up to 4 events

    if (upcoming.length === 0) {
        upcomingContainer.innerHTML = '<p>Nincsenek közelgő versenyek</p>';
        return;
    }

    upcomingContainer.innerHTML = upcoming.map(event => {
        const isPlanning = event.status === 'planning';
        const trackInfo = event.trackId ? tracks.find(t => t.id === event.trackId) : null;

        return `
        <div class="event-card" style="
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            ${isPlanning ? 'border: 2px solid var(--f1-red); background: linear-gradient(135deg, rgba(225, 6, 0, 0.05), rgba(225, 6, 0, 0.1));' : ''}
            position: relative;
            overflow: hidden;
        "
             onclick="showRaceDetails(${event.id})"
             onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(225, 6, 0, 0.4)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.1)'">

            ${isPlanning ? `
                <div style="
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--f1-red);
                    color: white;
                    padding: 4px 12px;
                    font-size: 11px;
                    font-weight: bold;
                    border-bottom-left-radius: 8px;
                ">
                    🗳️ SZAVAZÁS
                </div>
            ` : ''}

            <h4 style="margin-bottom: 8px; ${isPlanning ? 'color: var(--f1-red); font-weight: bold;' : ''}">${event.title}</h4>

            ${trackInfo ? `
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                    📍 ${trackInfo.name}
                </div>
            ` : ''}

            <p style="margin-bottom: 10px; font-size: 14px;">${event.description}</p>

            ${isPlanning ? `
                <div style="
                    background: rgba(225, 6, 0, 0.1);
                    border: 1px solid rgba(225, 6, 0, 0.3);
                    border-radius: 5px;
                    padding: 8px;
                    margin: 10px 0;
                    font-size: 12px;
                    text-align: center;
                    color: var(--f1-red);
                    font-weight: bold;
                ">
                    🗳️ Kattints ide az időpontok szavazásához!
                </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <small style="color: #666;">Létrehozta: ${event.createdBy}</small>
                <span class="status-badge status-${event.status || 'voting'}" style="
                    ${isPlanning ? 'background: var(--f1-red); color: white; font-weight: bold;' : ''}
                ">${getStatusText(event.status || 'voting')}</span>
            </div>
        </div>
        `;
    }).join('');
}

// Track Management Functions
function loadTracks() {
    const tracksList = document.getElementById('tracksList');
    if (tracks.length === 0) {
        tracksList.innerHTML = '<p>Még nincsenek pályák. Kattints a "Pálya Hozzáadása" gombra!</p>';
        return;
    }

    tracksList.innerHTML = tracks.map(track => `
        <div class="track-card">
            <h3>🏁 ${track.name}</h3>
            <p><strong>Cím:</strong> ${track.address}</p>
            <p><strong>Típus:</strong> ${track.type === 'outside' ? '🌤️ Kültéri' : '🏢 Beltéri'}</p>
            <p><strong>Ár/fő:</strong> ${track.pricePerPerson} Ft</p>
            ${track.description ? `<p><strong>Leírás:</strong> ${track.description}</p>` : ''}
            <div style="margin-top: 15px;">
                <button class="btn btn-warning" onclick="editTrack(${track.id})">Szerkesztés</button>
                <button class="btn btn-danger" onclick="deleteTrack(${track.id})">Törlés</button>
            </div>
        </div>
    `).join('');
}

function showAddTrack() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Új Pálya Hozzáadása</h2>
            <form id="trackForm">
                <div class="form-group">
                    <label for="trackName">Pálya Neve:</label>
                    <input type="text" id="trackName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="trackAddress">Cím:</label>
                    <input type="text" id="trackAddress" class="form-control" placeholder="Teljes cím..." required>
                </div>
                <div class="form-group">
                    <label for="trackType">Pálya Típusa:</label>
                    <select id="trackType" class="form-control" required>
                        <option value="">Válassz típust...</option>
                        <option value="outside">🌤️ Kültéri pálya</option>
                        <option value="inside">🏢 Beltéri pálya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="trackPrice">Ár/fő (Ft):</label>
                    <input type="number" id="trackPrice" class="form-control" placeholder="Ár forintban..." required>
                </div>
                <div class="form-group">
                    <label for="trackDescription">Leírás (opcionális):</label>
                    <textarea id="trackDescription" class="form-control" rows="3" placeholder="További információk a pályáról..."></textarea>
                </div>
                <button type="submit" class="btn">Pálya Hozzáadása</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Mégse</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('trackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newTrack = {
            id: Date.now(),
            name: document.getElementById('trackName').value,
            address: document.getElementById('trackAddress').value,
            type: document.getElementById('trackType').value,
            pricePerPerson: parseInt(document.getElementById('trackPrice').value),
            description: document.getElementById('trackDescription').value,
            createdBy: currentUser ? currentUser.username : 'Névtelen',
            createdAt: new Date().toISOString()
        };

        tracks.push(newTrack);
        localStorage.setItem('goKartTracks', JSON.stringify(tracks));
        loadTracks();
        updateDashboardStats();
        modal.remove();
    });
}

function editTrack(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Pálya Szerkesztése</h2>
            <form id="editTrackForm">
                <div class="form-group">
                    <label for="editTrackName">Pálya Neve:</label>
                    <input type="text" id="editTrackName" class="form-control" value="${track.name}" required>
                </div>
                <div class="form-group">
                    <label for="editTrackAddress">Cím:</label>
                    <input type="text" id="editTrackAddress" class="form-control" value="${track.address || ''}" required>
                </div>
                <div class="form-group">
                    <label for="editTrackType">Pálya Típusa:</label>
                    <select id="editTrackType" class="form-control" required>
                        <option value="">Válassz típust...</option>
                        <option value="outside" ${track.type === 'outside' ? 'selected' : ''}>🌤️ Kültéri pálya</option>
                        <option value="inside" ${track.type === 'inside' ? 'selected' : ''}>🏢 Beltéri pálya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editTrackPrice">Ár/fő (Ft):</label>
                    <input type="number" id="editTrackPrice" class="form-control" value="${track.pricePerPerson || ''}" required>
                </div>
                <div class="form-group">
                    <label for="editTrackDescription">Leírás (opcionális):</label>
                    <textarea id="editTrackDescription" class="form-control" rows="3">${track.description || ''}</textarea>
                </div>
                <button type="submit" class="btn">Pálya Frissítése</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Mégse</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('editTrackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const trackIndex = tracks.findIndex(t => t.id === trackId);
        tracks[trackIndex] = {
            ...track,
            name: document.getElementById('editTrackName').value,
            address: document.getElementById('editTrackAddress').value,
            type: document.getElementById('editTrackType').value,
            pricePerPerson: parseInt(document.getElementById('editTrackPrice').value),
            description: document.getElementById('editTrackDescription').value,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('goKartTracks', JSON.stringify(tracks));
        loadTracks();
        modal.remove();
    });
}

function deleteTrack(trackId) {
    if (confirm('Biztosan törölni szeretnéd ezt a pályát?')) {
        tracks = tracks.filter(t => t.id !== trackId);
        localStorage.setItem('goKartTracks', JSON.stringify(tracks));
        loadTracks();
        updateDashboardStats();
    }
}

// Driver Management Functions
function loadDrivers() {
    const driversList = document.getElementById('driversList');
    if (drivers.length === 0) {
        driversList.innerHTML = '<p>Még nincsenek versenyzők. Kattints a "Versenyző Hozzáadása" gombra!</p>';
        return;
    }

    driversList.innerHTML = drivers.map(driver => `
        <div class="driver-card">
            <h3>👤 ${driver.name}</h3>
            ${driver.nickname ? `<p><strong>Becenév:</strong> ${driver.nickname}</p>` : ''}
            ${driver.bio ? `<p><strong>Bemutatkozás:</strong> ${driver.bio}</p>` : ''}
            <p><strong>Csatlakozott:</strong> ${new Date(driver.createdAt).toLocaleDateString()}</p>
            <div style="margin-top: 15px;">
                <button class="btn btn-warning" onclick="editDriver(${driver.id})">Szerkesztés</button>
                <button class="btn btn-danger" onclick="deleteDriver(${driver.id})">Törlés</button>
            </div>
        </div>
    `).join('');
}

function showAddDriver() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Új Versenyző Hozzáadása</h2>
            <form id="driverForm">
                <div class="form-group">
                    <label for="driverName">Versenyző Neve:</label>
                    <input type="text" id="driverName" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="driverNickname">Becenév:</label>
                    <input type="text" id="driverNickname" class="form-control">
                </div>
                <div class="form-group">
                    <label for="driverBio">Bemutatkozás (opcionális):</label>
                    <textarea id="driverBio" class="form-control" rows="3"></textarea>
                </div>
                <button type="submit" class="btn">Versenyző Hozzáadása</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Mégse</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('driverForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newDriver = {
            id: Date.now(),
            name: document.getElementById('driverName').value,
            nickname: document.getElementById('driverNickname').value,
            bio: document.getElementById('driverBio').value,
            createdBy: currentUser ? currentUser.username : 'Névtelen',
            createdAt: new Date().toISOString(),
            stats: {
                races: 0,
                wins: 0,
                podiums: 0,
                fastestLaps: 0,
                points: 0
            }
        };

        drivers.push(newDriver);
        localStorage.setItem('goKartDrivers', JSON.stringify(drivers));
        loadDrivers();
        updateDashboardStats();
        modal.remove();
    });
}

function editDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Versenyző Szerkesztése</h2>
            <form id="editDriverForm">
                <div class="form-group">
                    <label for="editDriverName">Versenyző Neve:</label>
                    <input type="text" id="editDriverName" class="form-control" value="${driver.name}" required>
                </div>
                <div class="form-group">
                    <label for="editDriverNickname">Becenév:</label>
                    <input type="text" id="editDriverNickname" class="form-control" value="${driver.nickname || ''}">
                </div>
                <div class="form-group">
                    <label for="editDriverBio">Bemutatkozás:</label>
                    <textarea id="editDriverBio" class="form-control" rows="3">${driver.bio || ''}</textarea>
                </div>
                <button type="submit" class="btn">Versenyző Frissítése</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Mégse</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('editDriverForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const driverIndex = drivers.findIndex(d => d.id === driverId);
        drivers[driverIndex] = {
            ...driver,
            name: document.getElementById('editDriverName').value,
            nickname: document.getElementById('editDriverNickname').value,
            bio: document.getElementById('editDriverBio').value,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('goKartDrivers', JSON.stringify(drivers));
        loadDrivers();
        modal.remove();
    });
}

function deleteDriver(driverId) {
    if (confirm('Biztosan törölni szeretnéd ezt a versenyzőt?')) {
        drivers = drivers.filter(d => d.id !== driverId);
        localStorage.setItem('goKartDrivers', JSON.stringify(drivers));
        loadDrivers();
        updateDashboardStats();
    }
}

// Event Management Functions
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    if (events.length === 0) {
        eventsList.innerHTML = '<p>Még nincsenek versenyek. Kattints a "Verseny Létrehozása" gombra!</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="event-card">
            <h3>🏁 ${event.title}</h3>
            <p><strong>Leírás:</strong> ${event.description}</p>
            <p><strong>Státusz:</strong> <span class="status-badge status-${event.status || 'planning'}">${getStatusText(event.status || 'planning')}</span></p>
            <p><strong>Létrehozta:</strong> ${event.createdBy}</p>
            <p><strong>Létrehozva:</strong> ${new Date(event.createdAt).toLocaleDateString()}</p>
            <div style="margin-top: 15px;">
                <button class="btn" onclick="showRaceDetails(${event.id})">Részletek</button>
                <button class="btn btn-warning" onclick="editEvent(${event.id})">Szerkesztés</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Törlés</button>
            </div>
        </div>
    `).join('');
}

function showCreateEvent() {
    if (!requireAuth(() => showCreateEvent(), 'Verseny létrehozásához be kell jelentkezned.')) {
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Új Verseny Létrehozása</h2>
            <form id="eventForm">
                <div class="form-group">
                    <label for="eventTitle">Verseny Neve:</label>
                    <input type="text" id="eventTitle" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="eventDescription">Leírás:</label>
                    <textarea id="eventDescription" class="form-control" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="eventTrack">Pálya (opcionális):</label>
                    <select id="eventTrack" class="form-control">
                        <option value="">Válassz pályát...</option>
                        ${tracks.map(track => `<option value="${track.id}">${track.name}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="btn">Verseny Létrehozása</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Mégse</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedTrackId = document.getElementById('eventTrack').value;
        const selectedTrack = selectedTrackId ? tracks.find(t => t.id == selectedTrackId) : null;

        const newEvent = {
            id: Date.now(),
            title: selectedTrack ? `${selectedTrack.name} GP` : document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            trackId: selectedTrackId || null,
            status: 'planning',
            createdBy: currentUser.username,
            createdAt: new Date().toISOString(),
            proposedDates: generateProposedDates(),
            participants: [],
            votes: {}
        };

        events.push(newEvent);
        localStorage.setItem('goKartEvents', JSON.stringify(events));
        loadEvents();
        loadUpcomingEvents();
        updateDashboardStats();
        modal.remove();

        alert('Verseny sikeresen létrehozva! A résztvevők most szavazhatnak az időpontokra.');
    });
}

function generateProposedDates() {
    const dates = [];
    const today = new Date();

    for (let i = 7; i <= 21; i += 7) { // Next 3 weeks
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        date.setHours(18, 0, 0, 0); // 6 PM
        dates.push(date.toISOString());
    }

    return dates;
}

function getStatusText(status) {
    const statusTexts = {
        'planning': 'Tervezés',
        'voting': 'Szavazás',
        'date-selected': 'Időpont kiválasztva',
        'to-be-booked': 'Foglalásra vár',
        'booked': 'Lefoglalva',
        'race-awaiting': 'Verseny várható',
        'done': 'Befejezve',
        'cancelled': 'Törölve'
    };
    return statusTexts[status] || status;
}

function showRaceDetails(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    alert(`Verseny részletek: ${event.title}\n\nLeírás: ${event.description}\nStátusz: ${getStatusText(event.status)}`);
}

function editEvent(eventId) {
    alert('Verseny szerkesztése még nem implementált.');
}

function deleteEvent(eventId) {
    if (confirm('Biztosan törölni szeretnéd ezt a versenyt?')) {
        events = events.filter(e => e.id !== eventId);
        localStorage.setItem('goKartEvents', JSON.stringify(events));
        loadEvents();
        loadUpcomingEvents();
        updateDashboardStats();
    }
}

// Leaderboard and Profile Functions
function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');

    if (drivers.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Még nincsenek versenyzők</td></tr>';
        return;
    }

    const sortedDrivers = drivers.sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));

    leaderboardBody.innerHTML = sortedDrivers.map((driver, index) => `
        <tr>
            <td class="position-${index + 1 <= 3 ? index + 1 : ''}">${index + 1}</td>
            <td>${driver.name}${driver.nickname ? ` (${driver.nickname})` : ''}</td>
            <td>${driver.stats?.races || 0}</td>
            <td>${driver.stats?.wins || 0}</td>
            <td>${driver.stats?.podiums || 0}</td>
            <td>${driver.stats?.fastestLaps || 0}</td>
            <td>${driver.stats?.points || 0}</td>
        </tr>
    `).join('');
}

function loadProfile() {
    const profileStats = document.getElementById('profileStats');

    if (!currentUser) {
        profileStats.innerHTML = '<p>Bejelentkezés szükséges a statisztikák megtekintéséhez.</p>';
        return;
    }

    const driver = drivers.find(d => d.id === currentUser.driverId);
    if (!driver) {
        profileStats.innerHTML = '<p>Versenyző adatok nem találhatók.</p>';
        return;
    }

    profileStats.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-number">${driver.stats?.races || 0}</span>
                <span class="stat-label">Futamok</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${driver.stats?.wins || 0}</span>
                <span class="stat-label">Győzelmek</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${driver.stats?.podiums || 0}</span>
                <span class="stat-label">Dobogók</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${driver.stats?.fastestLaps || 0}</span>
                <span class="stat-label">Leggyorsabb Körök</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${driver.stats?.points || 0}</span>
                <span class="stat-label">Pontok</span>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h3>Versenyző Információk</h3>
            <p><strong>Név:</strong> ${driver.name}</p>
            ${driver.nickname ? `<p><strong>Becenév:</strong> ${driver.nickname}</p>` : ''}
            ${driver.bio ? `<p><strong>Bemutatkozás:</strong> ${driver.bio}</p>` : ''}
            <p><strong>Csatlakozott:</strong> ${new Date(driver.createdAt).toLocaleDateString()}</p>
        </div>
    `;
}

// Bug Report Functions
function showBugReport() {
    document.getElementById('bugReportModal').style.display = 'block';
    loadBugReports();
}

function loadBugReports() {
    const bugList = document.getElementById('bugList');
    const bugs = JSON.parse(localStorage.getItem('goKartBugs') || '[]');

    if (bugs.length === 0) {
        bugList.innerHTML = '<p>Még nincsenek beküldött hibák.</p>';
        return;
    }

    bugList.innerHTML = bugs.map(bug => `
        <div class="bug-item">
            <h4>${bug.title}</h4>
            <p>${bug.description}</p>
            ${bug.steps ? `<p><strong>Lépések:</strong> ${bug.steps}</p>` : ''}
            <div class="bug-meta">
                Beküldve: ${new Date(bug.createdAt).toLocaleString()} | ${bug.reportedBy}
            </div>
            <button class="solve-btn" onclick="solveBug(${bug.id})">Megoldva</button>
        </div>
    `).join('');
}

function solveBug(bugId) {
    let bugs = JSON.parse(localStorage.getItem('goKartBugs') || '[]');
    bugs = bugs.filter(bug => bug.id !== bugId);
    localStorage.setItem('goKartBugs', JSON.stringify(bugs));
    loadBugReports();
}

// Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // New driver form handler
    const newDriverForm = document.getElementById('newDriverForm');
    if (newDriverForm) {
        newDriverForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newDriver = {
                id: Date.now(),
                name: document.getElementById('newDriverName').value.trim(),
                nickname: document.getElementById('newDriverNickname').value.trim(),
                createdBy: 'System',
                createdAt: new Date().toISOString(),
                stats: {
                    races: 0,
                    wins: 0,
                    podiums: 0,
                    fastestLaps: 0,
                    points: 0
                }
            };

            // Add driver to the list
            drivers.push(newDriver);
            localStorage.setItem('goKartDrivers', JSON.stringify(drivers));

            // Auto-login as the new driver
            currentUser = {
                driverId: newDriver.id,
                username: newDriver.name,
                nickname: newDriver.nickname,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('currentGoKartUser', JSON.stringify(currentUser));
            updateUserInterface();
            closeModal('quickLoginModal');

            // Refresh data
            updateDashboardStats();
            loadDrivers();

            // Execute pending callback if exists
            if (window.pendingCallback) {
                window.pendingCallback();
                window.pendingCallback = null;
            }

            // Reset form
            newDriverForm.reset();
            hideAddDriverInLogin();
        });
    }

    // Bug report form handler
    const bugReportForm = document.getElementById('bugReportForm');
    if (bugReportForm) {
        bugReportForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newBug = {
                id: Date.now(),
                title: document.getElementById('bugTitle').value,
                description: document.getElementById('bugDescription').value,
                steps: document.getElementById('bugSteps').value,
                reportedBy: currentUser ? currentUser.username : 'Névtelen',
                createdAt: new Date().toISOString()
            };

            let bugs = JSON.parse(localStorage.getItem('goKartBugs') || '[]');
            bugs.push(newBug);
            localStorage.setItem('goKartBugs', JSON.stringify(bugs));

            bugReportForm.reset();
            loadBugReports();
            alert('Köszönjük a hibajelentést! Hamarosan javítjuk.');
        });
    }

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});
