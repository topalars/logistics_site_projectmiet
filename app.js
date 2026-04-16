// Глобальные данные
const warehouseData = {
    products: [],
    cells: [],
    orders: [],
    receiving: [],
    operations: []
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initWarehouse();
    setupNavigation();
    updateDate();
    renderCells();
    updateDashboard();
    loadSampleData();
});

// Инициализация склада
function initWarehouse() {
    // Создаем ячейки для 4 зон (A, B, C, D)
    const zones = ['A', 'B', 'C', 'D'];
    const cellsPerZone = 20;
    
    zones.forEach(zone => {
        for (let i = 1; i <= cellsPerZone; i++) {
            warehouseData.cells.push({
                id: `${zone}-${String(Math.ceil(i/5)).padStart(2, '0')}-${i % 5 || 5}`,
                zone: zone,
                row: Math.ceil(i/5),
                position: i % 5 || 5,
                status: 'free',
                product: null,
                quantity: 0
            });
        }
    });
}

// Загрузка тестовых данных
function loadSampleData() {
    // Добавляем тестовые товары
    const sampleProducts = [
        { sku: 'SKU-001', name: 'Смартфон Samsung Galaxy', category: 'Электроника', quantity: 50 },
        { sku: 'SKU-002', name: 'Ноутбук Lenovo', category: 'Электроника', quantity: 25 },
        { sku: 'SKU-003', name: 'Футболка белая', category: 'Одежда', quantity: 100 },
        { sku: 'SKU-004', name: 'Джинсы синие', category: 'Одежда', quantity: 75 },
        { sku: 'SKU-005', name: 'Кофеварка', category: 'Дом и сад', quantity: 30 },
        { sku: 'SKU-006', name: 'Набор посуды', category: 'Дом и сад', quantity: 40 },
        { sku: 'SKU-007', name: 'Наушники беспроводные', category: 'Электроника', quantity: 60 },
        { sku: 'SKU-008', name: 'Кроссовки спортивные', category: 'Спорт', quantity: 45 }
    ];
    
    warehouseData.products = sampleProducts.map((p, index) => ({
        ...p,
        id: index + 1,
        cells: []
    }));
    
    // Занимаем некоторые ячейки
    const occupiedIndices = [0, 1, 2, 5, 6, 10, 11, 15, 20, 25, 30, 35, 40, 50, 60];
    occupiedIndices.forEach((idx, i) => {
        if (warehouseData.cells[idx]) {
            warehouseData.cells[idx].status = 'occupied';
            const product = warehouseData.products[i % warehouseData.products.length];
            warehouseData.cells[idx].product = product.sku;
            warehouseData.cells[idx].quantity = Math.floor(Math.random() * 50) + 10;
            
            // Добавляем информацию о ячейке к продукту
            const prodIndex = warehouseData.products.findIndex(p => p.sku === product.sku);
            if (prodIndex !== -1 && !warehouseData.products[prodIndex].cells.includes(warehouseData.cells[idx].id)) {
                warehouseData.products[prodIndex].cells.push(warehouseData.cells[idx].id);
            }
        }
    });
    
    // Добавляем тестовые поставки
    warehouseData.receiving = [
        { id: 'REC-001', supplier: 'ООО "Техноснаб"', date: '2024-01-15', items: 25, status: 'completed' },
        { id: 'REC-002', supplier: 'ИП Петров', date: '2024-01-16', items: 15, status: 'completed' },
        { id: 'REC-003', supplier: 'АО "Логистик"', date: '2024-01-17', items: 40, status: 'in_progress' },
        { id: 'REC-004', supplier: 'ООО "Техноснаб"', date: '2024-01-18', items: 30, status: 'pending' }
    ];
    
    // Добавляем тестовые заказы
    warehouseData.orders = [
        { id: 'ORD-001', client: 'Иванов И.И.', priority: 'high', items: [{sku: 'SKU-001', qty: 2}], status: 'picking' },
        { id: 'ORD-002', client: 'Петров П.П.', priority: 'normal', items: [{sku: 'SKU-003', qty: 5}], status: 'pending' },
        { id: 'ORD-003', client: 'Сидоров С.С.', priority: 'urgent', items: [{sku: 'SKU-002', qty: 1}], status: 'picking' }
    ];
    
    // Добавляем последние операции
    const operationTypes = ['Приёмка', 'Размещение', 'Комплектация', 'Отгрузка'];
    for (let i = 0; i < 10; i++) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - i * 15);
        warehouseData.operations.push({
            time: now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}),
            type: operationTypes[Math.floor(Math.random() * operationTypes.length)],
            product: warehouseData.products[Math.floor(Math.random() * warehouseData.products.length)].name,
            cell: warehouseData.cells[Math.floor(Math.random() * warehouseData.cells.length)].id,
            status: ['Завершено', 'В процессе'][Math.floor(Math.random() * 2)]
        });
    }
    
    updateAllTables();
    updateProductCellSelect();
    updateOrderProductSelect();
}

// Навигация по разделам
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            
            // Обновляем активный пункт меню
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Показываем нужный раздел
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            // Обновляем дашборд если перешли на него
            if (sectionId === 'dashboard') {
                updateDashboard();
            }
        });
    });
}

// Обновление даты
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', options);
}

// Рендеринг ячеек склада
function renderCells() {
    const zones = ['A', 'B', 'C', 'D'];
    
    zones.forEach(zone => {
        const container = document.getElementById(`zone-${zone.toLowerCase()}-cells`);
        if (!container) return;
        
        container.innerHTML = '';
        const zoneCells = warehouseData.cells.filter(c => c.zone === zone);
        
        zoneCells.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell.status}`;
            cellDiv.textContent = cell.id.split('-')[2];
            cellDiv.title = `${cell.id}: ${cell.status === 'free' ? 'Свободно' : cell.product + ' (' + cell.quantity + ' шт)'}`;
            cellDiv.onclick = () => showCellInfo(cell);
            container.appendChild(cellDiv);
        });
    });
}

// Показать информацию о ячейке
function showCellInfo(cell) {
    let message = `Ячейка: ${cell.id}\n`;
    message += `Статус: ${cell.status === 'free' ? 'Свободно' : 'Занято'}\n`;
    if (cell.product) {
        message += `Товар: ${cell.product}\n`;
        message += `Количество: ${cell.quantity} шт`;
    }
    alert(message);
}

// Обновление дашборда
function updateDashboard() {
    const totalProducts = warehouseData.products.reduce((sum, p) => sum + p.quantity, 0);
    const occupiedCells = warehouseData.cells.filter(c => c.status === 'occupied').length;
    const pendingReceiving = warehouseData.receiving.filter(r => r.status === 'pending').length;
    const ordersPending = warehouseData.orders.filter(o => o.status === 'pending' || o.status === 'picking').length;
    
    document.getElementById('total-products').textContent = totalProducts.toLocaleString();
    document.getElementById('occupied-cells').textContent = `${occupiedCells}/${warehouseData.cells.length}`;
    document.getElementById('pending-receiving').textContent = pendingReceiving;
    document.getElementById('orders-pending').textContent = ordersPending;
    
    // Обновляем таблицу последних операций
    const tbody = document.getElementById('recent-operations-body');
    tbody.innerHTML = '';
    warehouseData.operations.slice(0, 10).forEach(op => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${op.time}</td>
            <td>${op.type}</td>
            <td>${op.product}</td>
            <td>${op.cell}</td>
            <td><span style="color: ${op.status === 'Завершено' ? 'var(--success-color)' : 'var(--warning-color)'}">${op.status}</span></td>
        `;
    });
}

// Обновление всех таблиц
function updateAllTables() {
    updateReceivingTable();
    updateInventoryTable();
}

// Таблица приёмки
function updateReceivingTable() {
    const tbody = document.getElementById('receiving-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    warehouseData.receiving.forEach(rec => {
        const row = tbody.insertRow();
        const statusColors = {
            'pending': '#f59e0b',
            'in_progress': '#005bff',
            'completed': '#10b981'
        };
        const statusTexts = {
            'pending': 'В ожидании',
            'in_progress': 'В процессе',
            'completed': 'Завершено'
        };
        row.innerHTML = `
            <td>${rec.id}</td>
            <td>${rec.supplier}</td>
            <td>${rec.date}</td>
            <td>${rec.items}</td>
            <td><span style="color: ${statusColors[rec.status]}">● ${statusTexts[rec.status]}</span></td>
            <td>
                <button class="btn btn-sm" onclick="viewReceiving('${rec.id}')">Просмотр</button>
            </td>
        `;
    });
}

// Таблица товаров
function updateInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    warehouseData.products.forEach(prod => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${prod.sku}</td>
            <td>${prod.name}</td>
            <td>${prod.category}</td>
            <td>${prod.quantity} шт</td>
            <td>${prod.cells.join(', ') || '-'}</td>
            <td>
                <button class="btn btn-sm" onclick="editProduct('${prod.sku}')">✏️</button>
                <button class="btn btn-sm" onclick="deleteProduct('${prod.sku}')" style="color: var(--danger-color)">🗑️</button>
            </td>
        `;
    });
}

// Обновление селекта ячеек в модальном окне товара
function updateProductCellSelect() {
    const select = document.getElementById('product-cell');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите ячейку</option>';
    warehouseData.cells.filter(c => c.status === 'free').slice(0, 20).forEach(cell => {
        const option = document.createElement('option');
        option.value = cell.id;
        option.textContent = cell.id;
        select.appendChild(option);
    });
}

// Обновление селекта товаров в модальном окне заказа
function updateOrderProductSelect() {
    const selects = document.querySelectorAll('.order-product-select');
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Выберите товар</option>';
        warehouseData.products.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.sku;
            option.textContent = `${prod.name} (${prod.quantity} шт)`;
            select.appendChild(option);
        });
        select.value = currentValue;
    });
}

// Модальные окна
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Закрытие модального окна по клику вне его
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Добавление строки товара в поставку
function addReceivingItem() {
    const container = document.getElementById('receiving-items');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Артикул" class="item-sku-input">
        <input type="number" placeholder="Количество" class="item-qty-input">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

// Добавление строки товара в заказ
function addOrderItem() {
    const container = document.getElementById('order-items');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <select class="order-product-select">
            <option value="">Выберите товар</option>
            ${warehouseData.products.map(p => `<option value="${p.sku}">${p.name} (${p.quantity} шт)</option>`).join('')}
        </select>
        <input type="number" placeholder="Кол-во" min="1" value="1">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

// Обработка форм
document.getElementById('receiving-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Поставка создана! (демо-режим)');
    closeModal('receiving-modal');
});

document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const sku = document.getElementById('product-sku').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const qty = parseInt(document.getElementById('product-qty').value);
    const cell = document.getElementById('product-cell').value;
    
    const newProduct = {
        id: warehouseData.products.length + 1,
        sku,
        name,
        category,
        quantity: qty,
        cells: cell ? [cell] : []
    };
    
    warehouseData.products.push(newProduct);
    
    if (cell) {
        const cellIndex = warehouseData.cells.findIndex(c => c.id === cell);
        if (cellIndex !== -1) {
            warehouseData.cells[cellIndex].status = 'occupied';
            warehouseData.cells[cellIndex].product = sku;
            warehouseData.cells[cellIndex].quantity = qty;
        }
    }
    
    updateInventoryTable();
    updateProductCellSelect();
    updateDashboard();
    closeModal('product-modal');
    e.target.reset();
});

document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Заказ создан! (демо-режим)');
    closeModal('order-modal');
});

// Функции для кнопок действий
function scanBarcode() {
    alert('Сканер штрих-кодов готов к работе.\n(В демо-режиме введите код вручную)');
}

function viewReceiving(id) {
    const rec = warehouseData.receiving.find(r => r.id === id);
    if (rec) {
        alert(`Поставка ${id}\nПоставщик: ${rec.supplier}\nДата: ${rec.date}\nТоваров: ${rec.items}\nСтатус: ${rec.status}`);
    }
}

function editProduct(sku) {
    const product = warehouseData.products.find(p => p.sku === sku);
    if (product) {
        alert(`Редактирование товара:\n${product.name}\nАртикул: ${product.sku}\nКоличество: ${product.quantity}`);
    }
}

function deleteProduct(sku) {
    if (confirm(`Удалить товар ${sku}?`)) {
        const index = warehouseData.products.findIndex(p => p.sku === sku);
        if (index !== -1) {
            warehouseData.products.splice(index, 1);
            updateInventoryTable();
            updateDashboard();
        }
    }
}

// Поиск товаров
document.getElementById('product-search')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventory-table-body tr');
    
    rows.forEach(row => {
        const sku = row.cells[0]?.textContent.toLowerCase() || '';
        const name = row.cells[1]?.textContent.toLowerCase() || '';
        if (sku.includes(searchTerm) || name.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Фильтр по категории
document.getElementById('category-filter')?.addEventListener('change', (e) => {
    const category = e.target.value;
    const rows = document.querySelectorAll('#inventory-table-body tr');
    
    rows.forEach(row => {
        const rowCategory = row.cells[2]?.textContent || '';
        if (!category || rowCategory === category) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Простая визуализация графиков с помощью Canvas
function drawSimpleChart(canvasId, data, labels, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...data);
    const barWidth = (width - 40) / data.length - 10;
    const startX = 30;
    const startY = height - 30;
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - 50);
        const x = startX + index * (barWidth + 10);
        const y = startY - barHeight;
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Подписи
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth/2, height - 10);
    });
}

// Инициализация графиков после загрузки страницы
setTimeout(() => {
    drawSimpleChart('activity-chart', [12, 19, 15, 25, 22, 30, 28], ['9:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'], ['#005bff', '#10b981', '#f59e0b', '#ef4444']);
    drawSimpleChart('turnover-chart', [45, 52, 38, 65, 48, 72, 55], ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], ['#005bff', '#10b981', '#f59e0b']);
    drawSimpleChart('efficiency-chart', [85, 92, 78, 95, 88], ['Зона A', 'Зона B', 'Зона C', 'Зона D', 'Зона E'], ['#005bff', '#10b981', '#f59e0b', '#ef4444']);
}, 100);

console.log('WMS Pro initialized successfully!');
