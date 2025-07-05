// Fault Tree Analysis Module - Performance Optimized
class FaultTreeModule {
    constructor() {
        this.treeData = null;
        this.canvas = null;
        this.ctx = null;
        this.currentTransform = { x: 0, y: 0, k: 1 };
        this.nodeWidth = 160;
        this.nodeHeight = 50;
        this.levelHeight = 100;
        this.expandedNodes = new Set();
        this.hoveredNode = null;
        this.animationFrame = null;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };

        // Performance optimizations
        this.renderCache = new Map();
        this.visibleNodes = [];
        this.needsRedraw = true;

        this.init();
    }

    init() {
        console.log('Fault Tree Module initialized (Canvas-based)');
    }

    // Generate fault tree from FMEA data
    generateTree() {
        if (!window.analyses || analyses.length === 0) {
            this.showEmptyState();
            this.showNotification('No FMEA analysis data available. Please create some analyses first.', 'warning');
            return;
        }

        console.log('Generating fault tree from FMEA data...');
        this.treeData = this.buildTreeStructure(analyses);
        this.expandedNodes.clear();
        this.expandedNodes.add(this.treeData.id); // Expand root by default
        this.renderTree();
        this.showNotification('Fault tree generated successfully!', 'success');
    }

    // Show empty state when no data
    showEmptyState() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.innerHTML = `
                <div class="fault-tree-empty">
                    <div class="empty-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M12 1v6m0 6v6" stroke="currentColor" stroke-width="1.5"/>
                            <path d="m21 12-6 0m-6 0-6 0" stroke="currentColor" stroke-width="1.5"/>
                            <path d="m16.24 7.76-4.24 4.24m-4.24 4.24-4.24-4.24" stroke="currentColor" stroke-width="1.5"/>
                            <path d="m16.24 16.24-4.24-4.24m-4.24-4.24-4.24 4.24" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <h3>No Fault Tree Data</h3>
                    <p>Add some FMEA analyses to generate an interactive fault tree visualization</p>
                </div>
            `;
        }
        this.cleanup();
    }

    // Build hierarchical tree structure from FMEA data
    buildTreeStructure(fmeaData) {
        const root = {
            id: 'system-failure',
            name: 'System Failure',
            type: 'root',
            children: []
        };

        // Group by components
        const componentGroups = {};
        fmeaData.forEach(entry => {
            if (!componentGroups[entry.component]) {
                componentGroups[entry.component] = [];
            }
            componentGroups[entry.component].push(entry);
        });

        // Create component nodes
        Object.keys(componentGroups).forEach(componentName => {
            const componentNode = {
                id: `component-${componentName}`,
                name: componentName,
                type: 'component',
                children: []
            };

            // Add failure modes for this component
            componentGroups[componentName].forEach(entry => {
                const failureNode = {
                    id: `failure-${entry.id}`,
                    name: entry.failureMode,
                    subtitle: entry.failureEffect,
                    type: 'failure',
                    rpn: entry.rpn,
                    severity: entry.severity,
                    occurrence: entry.occurrence,
                    detection: entry.detection,
                    children: []
                };

                // Add cause as child
                const causeNode = {
                    id: `cause-${entry.id}`,
                    name: entry.failureCause,
                    type: 'cause',
                    rpn: entry.rpn,
                    parent: failureNode
                };

                failureNode.children.push(causeNode);
                componentNode.children.push(failureNode);
            });

            root.children.push(componentNode);
        });

        return root;
    }

    // Render the tree visualization using Canvas for performance
    renderTree() {
        const container = document.getElementById('faultTreeCanvas');
        container.innerHTML = '';

        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'fault-tree-canvas-element';
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        const containerRect = container.getBoundingClientRect();
        this.canvas.width = containerRect.width * window.devicePixelRatio;
        this.canvas.height = containerRect.height * window.devicePixelRatio;
        this.canvas.style.width = containerRect.width + 'px';
        this.canvas.style.height = containerRect.height + 'px';
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Add zoom controls
        this.addZoomControls(container);

        // Calculate tree layout
        this.calculateLayout(this.treeData);

        // Setup interaction handlers
        this.setupInteractions();

        container.appendChild(this.canvas);

        // Center the tree
        this.centerTree();

        // Start render loop
        this.startRenderLoop();
    }

    // Calculate positions for all nodes (optimized)
    calculateLayout(node, x = 400, y = 50, level = 0) {
        node.x = x;
        node.y = y;
        node.level = level;

        if (node.children && node.children.length > 0 && this.expandedNodes.has(node.id)) {
            const spacing = this.nodeWidth + 30;
            const totalWidth = node.children.length * spacing;
            const startX = x - totalWidth / 2 + spacing / 2;

            node.children.forEach((child, index) => {
                const childX = startX + index * spacing;
                const childY = y + this.levelHeight;
                this.calculateLayout(child, childX, childY, level + 1);
            });
        }
    }

    // Start optimized render loop
    startRenderLoop() {
        const render = () => {
            if (this.needsRedraw) {
                this.draw();
                this.needsRedraw = false;
            }
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }

    // Main draw function
    draw() {
        if (!this.ctx || !this.treeData) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Apply transform
        this.ctx.save();
        this.ctx.translate(this.currentTransform.x, this.currentTransform.y);
        this.ctx.scale(this.currentTransform.k, this.currentTransform.k);

        // Draw connections first
        this.drawConnections(this.treeData);

        // Draw nodes
        this.drawNodes(this.treeData);

        this.ctx.restore();
    }

    // Draw all nodes using Canvas
    drawNodes(node) {
        if (!node) return;

        this.drawNode(node);

        if (node.children && this.expandedNodes.has(node.id)) {
            node.children.forEach(child => this.drawNodes(child));
        }
    }

    // Draw a single node
    drawNode(node) {
        const ctx = this.ctx;
        const x = node.x - this.nodeWidth / 2;
        const y = node.y - this.nodeHeight / 2;
        const isHovered = this.hoveredNode === node;

        // Get colors based on node type and theme
        const colors = this.getNodeColors(node, isHovered);

        // Draw node rectangle with rounded corners
        ctx.save();

        // Shadow for depth
        if (isHovered) {
            ctx.shadowColor = colors.shadow;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetY = 5;
        }

        this.drawRoundedRect(ctx, x, y, this.nodeWidth, this.nodeHeight, 8, colors.fill, colors.stroke);

        ctx.restore();

        // Draw text
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Main text
        const mainText = this.truncateText(node.name, 18);
        ctx.fillText(mainText, node.x, node.y - 8);

        // Subtitle
        if (node.subtitle) {
            ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = colors.subtitle;
            const subtitleText = this.truncateText(node.subtitle, 22);
            ctx.fillText(subtitleText, node.x, node.y + 6);
        }

        // RPN
        if (node.rpn) {
            ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = this.getRPNColor(node.rpn);
            ctx.fillText(`RPN: ${node.rpn}`, node.x, node.y + (node.subtitle ? 18 : 12));
        }

        // Expand/collapse button
        if (node.children && node.children.length > 0) {
            this.drawExpandButton(node);
        }
    }

    // Draw rounded rectangle
    drawRoundedRect(ctx, x, y, width, height, radius, fillColor, strokeColor) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    // Get node colors based on type and theme
    getNodeColors(node, isHovered = false) {
        const isDark = document.body.classList.contains('dark-theme');
        const alpha = isHovered ? 0.15 : 0.08;
        const strokeAlpha = isHovered ? 0.6 : 0.4;

        const colors = {
            root: { r: 255, g: 59, b: 48 },
            component: { r: 0, g: 122, b: 255 },
            failure: { r: 255, g: 149, b: 0 },
            cause: { r: 52, g: 199, b: 89 }
        };

        const color = colors[node.type] || colors.component;

        return {
            fill: `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`,
            stroke: `rgba(${color.r}, ${color.g}, ${color.b}, ${strokeAlpha})`,
            text: isDark ? '#F2F2F7' : '#1D1D1F',
            subtitle: isDark ? '#EBEBF5' : '#424245',
            shadow: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`
        };
    }

    // Get RPN color
    getRPNColor(rpn) {
        if (rpn >= 200) return '#FF3B30';
        if (rpn >= 100) return '#FF9500';
        return '#34C759';
    }

    // Draw expand/collapse button
    drawExpandButton(node) {
        const ctx = this.ctx;
        const isExpanded = this.expandedNodes.has(node.id);
        const buttonX = node.x + this.nodeWidth / 2 - 15;
        const buttonY = node.y + this.nodeHeight / 2 - 15;
        const radius = 8;

        // Button background
        ctx.beginPath();
        ctx.arc(buttonX, buttonY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Button icon
        ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#F2F2F7' : '#1D1D1F';
        ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isExpanded ? '−' : '+', buttonX, buttonY);

        // Store button bounds for click detection
        node.buttonBounds = {
            x: buttonX - radius,
            y: buttonY - radius,
            width: radius * 2,
            height: radius * 2
        };
    }

    // Draw connections between nodes
    drawConnections(node) {
        if (!node.children || !this.expandedNodes.has(node.id)) return;

        node.children.forEach(child => {
            this.drawConnection(node, child);
            this.drawConnections(child);
        });
    }

    // Draw connection line between parent and child
    drawConnection(parent, child) {
        const ctx = this.ctx;
        const startX = parent.x;
        const startY = parent.y + this.nodeHeight / 2;
        const endX = child.x;
        const endY = child.y - this.nodeHeight / 2;
        const midY = startY + (endY - startY) / 2;

        // Get connection color based on child's RPN
        let strokeColor = 'rgba(255, 255, 255, 0.3)';
        let lineWidth = 2;

        if (child.rpn) {
            if (child.rpn >= 200) {
                strokeColor = 'rgba(255, 59, 48, 0.6)';
                lineWidth = 3;
            } else if (child.rpn >= 100) {
                strokeColor = 'rgba(255, 149, 0, 0.6)';
                lineWidth = 2.5;
            } else {
                strokeColor = 'rgba(52, 199, 89, 0.6)';
                lineWidth = 2;
            }
        }

        // Draw curved connection
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(startX, midY, endX, midY, endX, endY);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    // Toggle node expansion
    toggleNode(node) {
        if (!node.children || node.children.length === 0) return;

        if (this.expandedNodes.has(node.id)) {
            this.expandedNodes.delete(node.id);
        } else {
            this.expandedNodes.add(node.id);
        }

        this.calculateLayout(this.treeData);
        this.needsRedraw = true;
    }

    // Expand all nodes
    expandAll() {
        this.collectAllNodeIds(this.treeData).forEach(id => {
            this.expandedNodes.add(id);
        });
        this.calculateLayout(this.treeData);
        this.needsRedraw = true;
        this.showNotification('All nodes expanded', 'info');
    }

    // Collapse all nodes
    collapseAll() {
        this.expandedNodes.clear();
        this.expandedNodes.add(this.treeData.id); // Keep root expanded
        this.calculateLayout(this.treeData);
        this.needsRedraw = true;
        this.showNotification('All nodes collapsed', 'info');
    }

    // Collect all node IDs recursively
    collectAllNodeIds(node) {
        const ids = [node.id];
        if (node.children) {
            node.children.forEach(child => {
                ids.push(...this.collectAllNodeIds(child));
            });
        }
        return ids;
    }

    // Truncate text to fit in nodes
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Simplified truncate text function
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Setup optimized interactions
    setupInteractions() {
        let startPoint = { x: 0, y: 0 };

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            startPoint = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            this.canvas.style.cursor = 'grabbing';

            // Check for node clicks
            const clickedNode = this.getNodeAtPoint(startPoint.x, startPoint.y);
            if (clickedNode) {
                this.handleNodeClick(clickedNode, startPoint.x, startPoint.y);
                return;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            if (this.isDragging) {
                const dx = mousePos.x - startPoint.x;
                const dy = mousePos.y - startPoint.y;

                this.currentTransform.x += dx;
                this.currentTransform.y += dy;

                this.needsRedraw = true;
                startPoint = mousePos;
            } else {
                // Handle hover
                const hoveredNode = this.getNodeAtPoint(mousePos.x, mousePos.y);
                if (hoveredNode !== this.hoveredNode) {
                    this.hoveredNode = hoveredNode;
                    this.needsRedraw = true;
                    this.canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
                }
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const oldScale = this.currentTransform.k;
            this.currentTransform.k *= delta;
            this.currentTransform.k = Math.max(0.1, Math.min(3, this.currentTransform.k));

            // Zoom towards mouse position
            const scaleChange = this.currentTransform.k / oldScale;
            this.currentTransform.x = mouseX - (mouseX - this.currentTransform.x) * scaleChange;
            this.currentTransform.y = mouseY - (mouseY - this.currentTransform.y) * scaleChange;

            this.needsRedraw = true;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                startPoint = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };
                this.isDragging = true;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isDragging) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const touchPos = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                };

                const dx = touchPos.x - startPoint.x;
                const dy = touchPos.y - startPoint.y;

                this.currentTransform.x += dx;
                this.currentTransform.y += dy;

                this.needsRedraw = true;
                startPoint = touchPos;
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
        });
    }

    // Get node at specific point
    getNodeAtPoint(x, y) {
        // Transform point to tree coordinates
        const treeX = (x - this.currentTransform.x) / this.currentTransform.k;
        const treeY = (y - this.currentTransform.y) / this.currentTransform.k;

        return this.findNodeAtPoint(this.treeData, treeX, treeY);
    }

    // Recursively find node at point
    findNodeAtPoint(node, x, y) {
        if (!node) return null;

        const nodeLeft = node.x - this.nodeWidth / 2;
        const nodeRight = node.x + this.nodeWidth / 2;
        const nodeTop = node.y - this.nodeHeight / 2;
        const nodeBottom = node.y + this.nodeHeight / 2;

        if (x >= nodeLeft && x <= nodeRight && y >= nodeTop && y <= nodeBottom) {
            return node;
        }

        if (node.children && this.expandedNodes.has(node.id)) {
            for (const child of node.children) {
                const found = this.findNodeAtPoint(child, x, y);
                if (found) return found;
            }
        }

        return null;
    }

    // Handle node click
    handleNodeClick(node, x, y) {
        // Check if click is on expand button
        if (node.buttonBounds) {
            const buttonX = (node.buttonBounds.x - this.currentTransform.x) / this.currentTransform.k;
            const buttonY = (node.buttonBounds.y - this.currentTransform.y) / this.currentTransform.k;
            const buttonRight = buttonX + node.buttonBounds.width;
            const buttonBottom = buttonY + node.buttonBounds.height;

            const treeX = (x - this.currentTransform.x) / this.currentTransform.k;
            const treeY = (y - this.currentTransform.y) / this.currentTransform.k;

            if (treeX >= buttonX && treeX <= buttonRight &&
                treeY >= buttonY && treeY <= buttonBottom) {
                this.toggleNode(node);
                return;
            }
        }

        // Regular node click - could add other interactions here
        console.log('Clicked node:', node.name);
    }

    // Add zoom control buttons
    addZoomControls(container) {
        const controls = document.createElement('div');
        controls.className = 'zoom-controls';
        
        const zoomIn = this.createZoomButton('+', () => this.zoomIn());
        const zoomOut = this.createZoomButton('−', () => this.zoomOut());
        
        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        container.appendChild(controls);
    }

    createZoomButton(text, onClick) {
        const button = document.createElement('button');
        button.className = 'zoom-btn';
        button.innerHTML = `<span>${text}</span>`;
        button.addEventListener('click', onClick);
        return button;
    }

    zoomIn() {
        this.currentTransform.k *= 1.2;
        this.currentTransform.k = Math.min(3, this.currentTransform.k);
        this.updateTransform();
    }

    zoomOut() {
        this.currentTransform.k *= 0.8;
        this.currentTransform.k = Math.max(0.1, this.currentTransform.k);
        this.updateTransform();
    }

    // Reset zoom and center tree
    resetZoom() {
        this.currentTransform = { x: 0, y: 0, k: 1 };
        this.centerTree();
        this.needsRedraw = true;
        this.showNotification('View reset', 'info');
    }

    // Center the tree in the viewport
    centerTree() {
        if (!this.treeData || !this.canvas) return;

        const containerRect = this.canvas.getBoundingClientRect();
        this.currentTransform.x = containerRect.width / 2 - 400;
        this.currentTransform.y = 50;
        this.needsRedraw = true;
    }

    // Cleanup function
    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.renderCache.clear();
        this.visibleNodes = [];
        this.hoveredNode = null;
    }

    // Destroy the module
    destroy() {
        this.cleanup();
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize fault tree module
let faultTreeModule;
document.addEventListener('DOMContentLoaded', () => {
    faultTreeModule = new FaultTreeModule();
});
