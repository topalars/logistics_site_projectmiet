/**
 * WMS Pro - Warehouse Management System
 * Modern, responsive JavaScript application
 */

// ===================================
// Application State
// ===================================
const AppState = {
    currentPage: 'dashboard',
    sidebarOpen: false,
    notifications: [],
    warehouseData: generateWarehouseData()
};

// ===================================
// Utility Functions
// ===================================
function generateWarehouseData() {
    const zones = ['A', 'B', 'C', 'D'];
    const data = [];
    
    zones.forEach(zone => {
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 6; col++) {
                const occupancy = Math.random();
                data.push({
                    id: `${zone}-${row.toString().padStart(2, '0')}-${col.toString().padStart(2, '0')}`,
                    zone,
                    row,
                    col,
                    occupancy,
                    status: occupancy > 0.9 ? 'full' : occupancy > 0.5 ? 'occupied' : occupancy > 0.3 ? 'warning' : 'empty',
                    items: occupancy > 0.3 ? Math.floor(Math.random() * 100) + 1 : 0
                });
            }
        }
    });
    
    return data;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
            ${type === 'success' 
                ? '<polyline points="20,6 9,17 4,12"/>'
                : type === 'error'
                ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
                : '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
// Navigation
// ===================================
function navigateTo(page) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update active page
    document.querySelectorAll('.page').forEach(pageEl => {
        pageEl.classList.toggle('active', pageEl.id === `${page}Page`);
    });
    
    // Update page title
    const titles = {
        dashboard: 'Дашборд',
        receiving: 'Приёмка',
        storage: 'Хранение',
        picking: 'Комплектация',
        shipping: 'Отгрузка',
        inventory: 'Инвентаризация',
        analytics: 'Аналитика'
    };
    
    document.getElementById('pageTitle').textContent = titles[page] || 'WMS Pro';
    AppState.currentPage = page;
    
    // Close mobile menu
    if (AppState.sidebarOpen) {
        toggleSidebar();
    }
    
    // Initialize page-specific features
    if (page === 'storage') {
        renderWarehouseMap();
    }
}

// ===================================
// Sidebar
// ===================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    AppState.sidebarOpen = !AppState.sidebarOpen;
    sidebar.classList.toggle('open', AppState.sidebarOpen);
}

// ===================================
// Modal
// ===================================
function openModal(title, content) {
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    overlay.classList.add('active');
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
}

// ===================================
// Warehouse Map
// ===================================
function renderWarehouseMap(filter = 'all') {
    const container = document.getElementById('warehouseMap');
    if (!container) return;
    
    const filteredData = filter === 'all' 
        ? AppState.warehouseData 
        : AppState.warehouseData.filter(cell => cell.zone === filter);
    
    container.innerHTML = filteredData.map(cell => `
        <div class="storage-cell ${cell.status}" data-cell="${cell.id}" title="${cell.id}: ${cell.items} товаров">
            <div class="cell-label">${cell.id}</div>
            ${cell.items > 0 ? `<div class="cell-count">${cell.items} шт</div>` : ''}
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.storage-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const cellId = cell.dataset.cell;
            const cellData = AppState.warehouseData.find(c => c.id === cellId);
            
            openModal(
                `Ячейка ${cellId}`,
                `
                    <div style="margin-bottom: 1rem;">
                        <strong>Зона:</strong> ${cellData.zone}<br>
                        <strong>Ряд:</strong> ${cellData.row}<br>
                        <strong>Колонна:</strong> ${cellData.col}<br>
                        <strong>Статус:</strong> ${getStatusName(cellData.status)}<br>
                        <strong>Товаров:</strong> ${cellData.items} шт
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" onclick="showToast('Действие выполнено')">Переместить</button>
                        <button class="btn btn-outline" onclick="closeModal()">Закрыть</button>
                    </div>
                `
            );
        });
    });
}

function getStatusName(status) {
    const names = {
        empty: 'Пустая',
        warning: 'Мало товаров',
        occupied: 'Заполнена',
        full: 'Полная'
    };
    return names[status] || status;
}

// ===================================
// Charts (Simple Canvas Implementation)
// ===================================
function initCharts() {
    const opsChart = document.getElementById('operationsChart');
    if (opsChart && opsChart.getContext) {
        const ctx = opsChart.getContext('2d');
        drawSimpleChart(ctx, [65, 78, 52, 89, 95, 72, 88], '#1a56db');
    }
    
    const prodChart = document.getElementById('productivityChart');
    if (prodChart && prodChart.getContext) {
        const ctx = prodChart.getContext('2d');
        drawSimpleChart(ctx, [45, 67, 82, 71, 93, 85, 79], '#059669');
    }
    
    const ordersChart = document.getElementById('ordersChart');
    if (ordersChart && ordersChart.getContext) {
        const ctx = ordersChart.getContext('2d');
        drawPieChart(ctx, [45, 25, 20, 10]);
    }
}

function drawSimpleChart(ctx, data, color) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const padding = 40;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...data);
    const barWidth = (width - padding * 2) / data.length - 10;
    const chartHeight = height - padding * 2;
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + 10);
        const y = height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value
        ctx.fillStyle = '#4b5563';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth / 2, y - 5);
        
        // Draw label
        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        ctx.fillText(days[index] || '', x + barWidth / 2, height - padding + 20);
    });
    
    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
}

function drawPieChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    const total = data.reduce((a, b) => a + b, 0);
    const colors = ['#1a56db', '#059669', '#d97706', '#dc2626'];
    const labels = ['В работе', 'Готовы', 'На проверке', 'Новые'];
    
    let startAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        // Draw label
        const midAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${value}%`, labelX, labelY);
        
        startAngle += sliceAngle;
    });
    
    // Draw legend
    const legendX = 20;
    let legendY = 20;
    
    labels.forEach((label, index) => {
        ctx.fillStyle = colors[index];
        ctx.fillRect(legendX, legendY - 6, 12, 12);
        
        ctx.fillStyle = '#4b5563';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + 18, legendY + 4);
        
        legendY += 25;
    });
}

// ===================================
// Event Listeners
// ===================================
function initEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleSidebar);
    
    // Modal close
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    
    // Zone filters
    document.querySelectorAll('.zone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWarehouseMap(btn.dataset.zone);
        });
    });
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const map = document.getElementById('warehouseMap');
            if (map) {
                map.style.display = btn.dataset.view === 'grid' ? 'grid' : 'flex';
                map.style.flexDirection = 'column';
            }
        });
    });
    
    // Action buttons
    document.getElementById('newReceivingBtn')?.addEventListener('click', () => {
        openModal('Новая приёмка', `
            <form onsubmit="event.preventDefault(); closeModal(); showToast('Приёмка создана');">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Поставщик</label>
                    <input type="text" class="search-input" style="width: 100%;" required>
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Дата поставки</label>
                    <input type="datetime-local" class="search-input" style="width: 100%;" required>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Отмена</button>
                    <button type="submit" class="btn btn-primary">Создать</button>
                </div>
            </form>
        `);
    });
    
    document.getElementById('newPickingBtn')?.addEventListener('click', () => {
        showToast('Функция в разработке', 'warning');
    });
    
    document.getElementById('newShippingBtn')?.addEventListener('click', () => {
        showToast('Функция в разработке', 'warning');
    });
    
    document.getElementById('newInventoryBtn')?.addEventListener('click', () => {
        showToast('Функция в разработке', 'warning');
    });
    
    // Search
    document.getElementById('globalSearch')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            console.log('Search:', query);
            // Implement search functionality
        }
    });
    
    // Notifications
    document.getElementById('notificationBtn')?.addEventListener('click', () => {
        openModal('Уведомления', `
            <div style="max-height: 400px; overflow-y: auto;">
                <div style="padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>Новая поставка</strong>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Поставка #П-2024-1542 ожидается через 15 минут</p>
                    <span style="font-size: 0.75rem; color: #9ca3af;">5 мин назад</span>
                </div>
                <div style="padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>Завершена инвентаризация</strong>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Зона B проверена, найдено 2 расхождения</p>
                    <span style="font-size: 0.75rem; color: #9ca3af;">1 час назад</span>
                </div>
                <div style="padding: 1rem 0;">
                    <strong>Срочный заказ</strong>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Заказ #З-789460 требует приоритетной комплектации</p>
                    <span style="font-size: 0.75rem; color: #9ca3af;">2 часа назад</span>
                </div>
            </div>
        `);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch')?.focus();
        }
    });
}

// ===================================
// Initialize Application
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initCharts();
    renderWarehouseMap();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Добро пожаловать в WMS Pro!', 'success');
    }, 500);
});

// Export functions for global access
window.closeModal = closeModal;
window.showToast = showToast;
