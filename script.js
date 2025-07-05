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
        // Auto-generate fully expanded tree if we have data and no tree exists
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

function editAnalysis(analysisId) {
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis) return;

    // Store the analysis being edited
    window.editingAnalysisId = analysisId;

    // Populate the form with existing data
    document.getElementById('component').value = analysis.component;
    document.getElementById('function').value = analysis.function;
    document.getElementById('failureMode').value = analysis.failureMode;
    document.getElementById('failureEffect').value = analysis.failureEffect;
    document.getElementById('failureCause').value = analysis.failureCause;
    document.getElementById('severity').value = analysis.severity;
    document.getElementById('occurrence').value = analysis.occurrence;
    document.getElementById('detection').value = analysis.detection;

    // Update RPN display
    updateRPN();

    // Switch to analysis tab
    showSection('analysis');

    // Change submit button to update mode
    const submitBtn = document.querySelector('#analysisForm button[type="submit"]');
    submitBtn.textContent = 'Update Analysis';
    submitBtn.style.background = 'linear-gradient(135deg, #FF9500, #FF6B35)';

    // Show cancel edit button
    showCancelEditButton();

    // Scroll to top of form
    document.getElementById('analysisForm').scrollIntoView({ behavior: 'smooth' });

    showNotification(`Editing analysis: ${analysis.component} - ${analysis.failureMode}`, 'info');
}

function showCancelEditButton() {
    // Check if cancel button already exists
    if (document.getElementById('cancelEditBtn')) return;

    const submitBtn = document.querySelector('#analysisForm button[type="submit"]');
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'cancelEditBtn';
    cancelBtn.className = 'btn secondary-btn';
    cancelBtn.textContent = 'Cancel Edit';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.onclick = cancelEdit;

    submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
}

function cancelEdit() {
    // Clear editing state
    window.editingAnalysisId = null;

    // Reset form
    document.getElementById('analysisForm').reset();
    updateRPN();

    // Reset submit button
    const submitBtn = document.querySelector('#analysisForm button[type="submit"]');
    submitBtn.textContent = 'Add Analysis';
    submitBtn.style.background = '';

    // Remove cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }

    showNotification('Edit cancelled', 'info');
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

    const analysisData = {
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

    if (window.editingAnalysisId) {
        // Update existing analysis
        const index = analyses.findIndex(a => a.id === window.editingAnalysisId);
        if (index !== -1) {
            analyses[index] = { ...analysisData, id: window.editingAnalysisId };
            showNotification('Analysis updated successfully!', 'success');
        }

        // Reset edit mode
        cancelEdit();
    } else {
        // Add new analysis
        const analysis = { ...analysisData, id: Date.now() };
        analyses.push(analysis);
        showNotification('Analysis added successfully!', 'success');
        clearForm();
    }

    window.analyses = analyses; // Update global reference
    displayResults();
    saveData();

    // Update fault tree if it exists and is currently visible
    if (window.faultTreeModule && faultTreeModule.treeData) {
        faultTreeModule.generateTree();
    }
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
                            <div class="action-buttons">
                                <button class="btn edit-btn" onclick="editAnalysis(${analysis.id})" title="Edit this analysis">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Edit
                                </button>
                                <button class="btn delete-btn" onclick="deleteAnalysis(${analysis.id})" title="Delete this analysis">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Delete
                                </button>
                            </div>
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

    // If no version marker or old data exists, clear it
    if (!dataVersion || dataVersion !== 'personal_finance_ai_v1') {
        if (savedComponents) {
            const parsedComponents = JSON.parse(savedComponents);
            // Check if old data exists (automotive, banking, etc.)
            if (parsedComponents.includes('Engine') || parsedComponents.includes('Brake System') ||
                parsedComponents.includes('ATM Network') || parsedComponents.includes('Core Banking System')) {
                localStorage.removeItem('fmea_components');
                localStorage.removeItem('fmea_analyses');
                localStorage.removeItem('fmea_data_version');
                console.log('Cleared old demo data, loading Personal Finance AI data');
                return true;
            }
        }
        // Also clear if no version marker exists or different version
        if (!dataVersion || dataVersion !== 'personal_finance_ai_v1') {
            localStorage.clear();
            console.log('Updating to Personal Finance AI demo data');
            return true;
        }
    }
    return false;
}

// Add sample data for demonstration
function addSampleData() {
    const clearedOldData = clearOldData();
    if (components.length === 0 && analyses.length === 0 || clearedOldData) {
        // Add sample Personal Finance Management AI components
        components = ['AI Expense Categorization', 'Smart Budget Advisor', 'Fraud Detection AI', 'Investment Recommendation Engine', 'Credit Score Predictor'];

        // Add sample Personal Finance Management AI analyses
        analyses = [
            {
                id: Date.now() + 1,
                component: 'AI Expense Categorization',
                function: 'Automatically categorize user transactions using machine learning',
                failureMode: 'AI model misclassifies transactions',
                failureEffect: 'Incorrect budget tracking, poor financial insights',
                failureCause: 'Insufficient training data or model drift over time',
                severity: 7,
                occurrence: 5,
                detection: 4,
                rpn: 140
            },
            {
                id: Date.now() + 2,
                component: 'Smart Budget Advisor',
                function: 'Provide AI-powered personalized budget recommendations',
                failureMode: 'Budget recommendations are unrealistic or harmful',
                failureEffect: 'User financial stress, loss of trust in AI system',
                failureCause: 'Algorithm bias or incomplete user financial profile',
                severity: 8,
                occurrence: 3,
                detection: 6,
                rpn: 144
            },
            {
                id: Date.now() + 3,
                component: 'Fraud Detection AI',
                function: 'Real-time detection of suspicious financial activities',
                failureMode: 'AI fails to detect fraudulent transactions',
                failureEffect: 'Financial losses, compromised user accounts',
                failureCause: 'Sophisticated fraud patterns not in training data',
                severity: 9,
                occurrence: 3,
                detection: 5,
                rpn: 135
            },
            {
                id: Date.now() + 4,
                component: 'Investment Recommendation Engine',
                function: 'AI-driven personalized investment portfolio suggestions',
                failureMode: 'AI recommends high-risk investments inappropriately',
                failureEffect: 'User financial losses, regulatory compliance issues',
                failureCause: 'Risk tolerance assessment errors or market volatility',
                severity: 9,
                occurrence: 2,
                detection: 7,
                rpn: 126
            },
            {
                id: Date.now() + 5,
                component: 'Credit Score Predictor',
                function: 'Predict credit score changes using AI analytics',
                failureMode: 'AI provides inaccurate credit score predictions',
                failureEffect: 'Poor financial decisions, missed opportunities',
                failureCause: 'Outdated credit bureau data or model overfitting',
                severity: 6,
                occurrence: 4,
                detection: 5,
                rpn: 120
            },
            {
                id: Date.now() + 6,
                component: 'Smart Budget Advisor',
                function: 'Send AI-powered spending alerts and notifications',
                failureMode: 'AI sends excessive or irrelevant notifications',
                failureEffect: 'User notification fatigue, system abandonment',
                failureCause: 'Poor notification threshold tuning or user preference learning',
                severity: 5,
                occurrence: 6,
                detection: 3,
                rpn: 90
            }
        ];

        // Update global references
        window.components = components;
        window.analyses = analyses;

        // Set version marker for Personal Finance AI data
        localStorage.setItem('fmea_data_version', 'personal_finance_ai_v1');

        saveData();
        updateComponentsList();
        updateComponentSelect();
        showNotification('Personal Finance AI demo data loaded successfully', 'success');
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
