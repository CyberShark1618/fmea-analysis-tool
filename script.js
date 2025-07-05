// Simple FMEA Tool - Working Version
let components = [];
let analyses = [];
let currentTheme = 'light';

// Make analyses globally accessible for fault tree module
window.analyses = analyses;
window.components = components;

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    if (sectionName === 'results') {
        displayResults();
    } else if (sectionName === 'faultTree') {
        // Auto-generate tree if we have data and no tree exists
        if (analyses.length > 0 && faultTreeModule && !faultTreeModule.treeData) {
            setTimeout(() => faultTreeModule.generateTree(), 100);
        }
    }
}

function addComponent() {
    const input = document.getElementById('componentName');
    const name = input.value.trim();

    if (!name) {
        alert('Please enter a component name');
        return;
    }

    if (components.includes(name)) {
        alert('Component already exists');
        return;
    }

    components.push(name);
    window.components = components; // Update global reference
    input.value = '';
    updateComponentsList();
    updateComponentSelect();
    saveData();
}

function updateComponentsList() {
    const list = document.getElementById('componentsList');
    
    if (components.length === 0) {
        list.innerHTML = '<p>No components added yet.</p>';
        return;
    }
    
    list.innerHTML = components.map(component => `
        <div class="component-item">
            <span>${component}</span>
            <button class="btn delete-btn" onclick="deleteComponent('${component}')">Delete</button>
        </div>
    `).join('');
}

function deleteComponent(name) {
    if (confirm(`Delete component "${name}"?`)) {
        components = components.filter(c => c !== name);
        window.components = components; // Update global reference
        updateComponentsList();
        updateComponentSelect();
        saveData();
    }
}

function deleteAnalysis(analysisId) {
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis) return;

    if (confirm(`Delete analysis for "${analysis.component} - ${analysis.failureMode}"?\n\nThis will also update the fault tree.`)) {
        // Remove from analyses array
        analyses = analyses.filter(a => a.id !== analysisId);
        window.analyses = analyses; // Update global reference

        // Update displays
        displayResults();
        saveData();

        // Update fault tree if it exists and is currently visible
        if (window.faultTreeModule && faultTreeModule.treeData) {
            // Regenerate fault tree with updated data
            faultTreeModule.generateTree();
        }

        // Show success notification
        showNotification(`Analysis deleted successfully. Fault tree updated.`, 'success');

        // Add smooth row removal animation
        const row = document.getElementById(`analysis-row-${analysisId}`);
        if (row) {
            row.style.transition = 'all 0.3s ease-out';
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                if (row.parentElement) {
                    row.remove();
                }
            }, 300);
        }
    }
}

function updateComponentSelect() {
    const select = document.getElementById('component');
    select.innerHTML = '<option value="">Select component...</option>';
    
    components.forEach(component => {
        const option = document.createElement('option');
        option.value = component;
        option.textContent = component;
        select.appendChild(option);
    });
}

function calculateRPN() {
    const severity = parseInt(document.getElementById('severity').value) || 1;
    const occurrence = parseInt(document.getElementById('occurrence').value) || 1;
    const detection = parseInt(document.getElementById('detection').value) || 1;
    
    const rpn = severity * occurrence * detection;
    document.getElementById('rpnDisplay').textContent = rpn;
    return rpn;
}

function submitAnalysis(event) {
    event.preventDefault();

    const analysis = {
        id: Date.now(),
        component: document.getElementById('component').value,
        function: document.getElementById('function').value,
        failureMode: document.getElementById('failureMode').value,
        failureEffect: document.getElementById('failureEffect').value,
        failureCause: document.getElementById('failureCause').value,
        severity: parseInt(document.getElementById('severity').value),
        occurrence: parseInt(document.getElementById('occurrence').value),
        detection: parseInt(document.getElementById('detection').value),
        rpn: calculateRPN()
    };

    analyses.push(analysis);
    window.analyses = analyses; // Update global reference
    alert('Analysis saved successfully!');
    clearForm();
    saveData();
}

function clearForm() {
    document.getElementById('component').value = '';
    document.getElementById('function').value = '';
    document.getElementById('failureMode').value = '';
    document.getElementById('failureEffect').value = '';
    document.getElementById('failureCause').value = '';
    document.getElementById('severity').value = '5';
    document.getElementById('occurrence').value = '5';
    document.getElementById('detection').value = '5';
    calculateRPN();
}

function displayResults() {
    const resultsList = document.getElementById('resultsList');

    if (analyses.length === 0) {
        resultsList.innerHTML = '<p>No analysis results yet.</p>';
        return;
    }

    const sortedAnalyses = analyses.sort((a, b) => b.rpn - a.rpn);

    resultsList.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: rgba(0, 122, 255, 0.1);">
                    <th style="padding: 12px; border: 1px solid #ddd;">Component</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">Failure Mode</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">S</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">O</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">D</th>
                    <th style="padding: 12px; border: 1px solid #ddd;">RPN</th>
                    <th style="padding: 12px; border: 1px solid #ddd; width: 100px;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sortedAnalyses.map(analysis => `
                    <tr id="analysis-row-${analysis.id}">
                        <td style="padding: 12px; border: 1px solid #ddd;">${analysis.component}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${analysis.failureMode}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${analysis.severity}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${analysis.occurrence}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${analysis.detection}</td>
                        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: ${analysis.rpn >= 200 ? '#dc3545' : analysis.rpn >= 100 ? '#ffc107' : '#28a745'};">${analysis.rpn}</td>
                        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
                            <button class="btn delete-btn" onclick="deleteAnalysis(${analysis.id})" title="Delete this analysis">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Data persistence
function saveData() {
    try {
        localStorage.setItem('fmea_components', JSON.stringify(components));
        localStorage.setItem('fmea_analyses', JSON.stringify(analyses));
        localStorage.setItem('fmea_theme', currentTheme);
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

function loadData() {
    try {
        const savedComponents = localStorage.getItem('fmea_components');
        const savedAnalyses = localStorage.getItem('fmea_analyses');
        const savedTheme = localStorage.getItem('fmea_theme');

        if (savedComponents) {
            components = JSON.parse(savedComponents);
            window.components = components; // Update global reference
        }

        if (savedAnalyses) {
            analyses = JSON.parse(savedAnalyses);
            window.analyses = analyses; // Update global reference
        }

        if (savedTheme) {
            currentTheme = savedTheme;
            setTheme(savedTheme);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
                border-radius: 12px;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                animation: slideInRight 0.3s ease-out;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .notification-success { background: rgba(52, 199, 89, 0.9); color: white; }
            .notification-error { background: rgba(255, 59, 48, 0.9); color: white; }
            .notification-warning { background: rgba(255, 149, 0, 0.9); color: white; }
            .notification-info { background: rgba(0, 122, 255, 0.9); color: white; }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                gap: 12px;
            }
            .notification-message { flex: 1; font-weight: 500; }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification-close:hover { opacity: 1; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Theme management
function setTheme(theme) {
    currentTheme = theme;
    document.body.className = `${theme}-theme`;
    localStorage.setItem('fmea_theme', theme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Clear old automotive data and force banking data
function clearOldData() {
    const dataVersion = localStorage.getItem('fmea_data_version');
    const savedComponents = localStorage.getItem('fmea_components');

    // If no version marker or old automotive data exists, clear it
    if (!dataVersion || dataVersion !== 'banking_v1') {
        if (savedComponents) {
            const parsedComponents = JSON.parse(savedComponents);
            // Check if old automotive data exists
            if (parsedComponents.includes('Engine') || parsedComponents.includes('Brake System') || parsedComponents.includes('Fuel System')) {
                localStorage.removeItem('fmea_components');
                localStorage.removeItem('fmea_analyses');
                localStorage.removeItem('fmea_data_version');
                console.log('Cleared old automotive demo data, loading banking data');
                return true;
            }
        }
        // Also clear if no version marker exists
        if (!dataVersion) {
            localStorage.clear();
            console.log('No version marker found, clearing all data for banking update');
            return true;
        }
    }
    return false;
}

// Add sample data for demonstration
function addSampleData() {
    const clearedOldData = clearOldData();
    if (components.length === 0 && analyses.length === 0 || clearedOldData) {
        // Add sample banking components
        components = ['ATM Network', 'Online Banking Platform', 'Payment Processing', 'Core Banking System', 'Security Infrastructure'];

        // Add sample banking analyses
        analyses = [
            {
                id: Date.now() + 1,
                component: 'ATM Network',
                function: 'Provide 24/7 cash withdrawal and banking services',
                failureMode: 'ATM communication failure',
                failureEffect: 'Customer unable to access funds, service disruption',
                failureCause: 'Network connectivity issues or server downtime',
                severity: 8,
                occurrence: 4,
                detection: 6,
                rpn: 192
            },
            {
                id: Date.now() + 2,
                component: 'Online Banking Platform',
                function: 'Enable secure digital banking transactions',
                failureMode: 'Authentication system failure',
                failureEffect: 'Customers locked out, potential security breach',
                failureCause: 'Database corruption or authentication server failure',
                severity: 9,
                occurrence: 3,
                detection: 7,
                rpn: 189
            },
            {
                id: Date.now() + 3,
                component: 'Payment Processing',
                function: 'Process credit/debit card transactions',
                failureMode: 'Transaction processing delay',
                failureEffect: 'Payment failures, customer dissatisfaction',
                failureCause: 'High transaction volume or system overload',
                severity: 7,
                occurrence: 5,
                detection: 4,
                rpn: 140
            },
            {
                id: Date.now() + 4,
                component: 'Core Banking System',
                function: 'Manage customer accounts and transactions',
                failureMode: 'Database synchronization failure',
                failureEffect: 'Incorrect account balances, transaction errors',
                failureCause: 'Database replication lag or corruption',
                severity: 9,
                occurrence: 2,
                detection: 6,
                rpn: 108
            },
            {
                id: Date.now() + 5,
                component: 'Security Infrastructure',
                function: 'Protect against cyber threats and fraud',
                failureMode: 'Fraud detection system bypass',
                failureEffect: 'Unauthorized transactions, financial losses',
                failureCause: 'Outdated fraud patterns or system configuration error',
                severity: 10,
                occurrence: 2,
                detection: 5,
                rpn: 100
            },
            {
                id: Date.now() + 6,
                component: 'Online Banking Platform',
                function: 'Provide mobile banking services',
                failureMode: 'Mobile app crashes',
                failureEffect: 'Service unavailable, customer frustration',
                failureCause: 'Software bugs or insufficient server capacity',
                severity: 6,
                occurrence: 4,
                detection: 3,
                rpn: 72
            }
        ];

        // Update global references
        window.components = components;
        window.analyses = analyses;

        // Set version marker for banking data
        localStorage.setItem('fmea_data_version', 'banking_v1');

        saveData();
        updateComponentsList();
        updateComponentSelect();
        showNotification('Banking demo data loaded successfully', 'success');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing FMEA Tool...');

    // Load saved data
    loadData();

    // Add sample data if none exists
    addSampleData();

    // Update components list and select
    updateComponentsList();
    updateComponentSelect();

    // Add event listeners for RPN calculation
    ['severity', 'occurrence', 'detection'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateRPN);
        }
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Component name input enter key
    const componentNameInput = document.getElementById('componentName');
    if (componentNameInput) {
        componentNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addComponent();
            }
        });
    }

    // Initial RPN calculation
    calculateRPN();

    console.log('FMEA Tool initialized successfully');
});
