document.addEventListener('DOMContentLoaded', loadContacts);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterContacts);
}

let allData = null;

async function loadContacts() {
    const loading = document.getElementById('loading');
    const directory = document.getElementById('directory');
    const stats = document.getElementById('stats');
    
    try {
        const response = await fetch('contacts.json');
        if (!response.ok) throw new Error('Файл с контактами не найден');
        
        allData = await response.json();
        displayContacts(allData);
        updateStats(allData);
        loading.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loading.innerHTML = '❌ Не удалось загрузить контакты';
    }
}

// Функция копирования данных в буфер обмена
function copyContactData(settlement) {
    // Формируем текст для копирования
    let textToCopy = `${settlement.name}\n`;
    textToCopy += `Глава: ${settlement.head}\n`;
    if (settlement.position) textToCopy += `Должность: ${settlement.position}\n`;
    textToCopy += `Телефон: ${settlement.phone}\n`;
    textToCopy += `Email: ${settlement.email}`;
    if (settlement.website) textToCopy += `\nСайт: ${settlement.website}`;
    if (settlement.max) textToCopy += `\nКанал MAX: ${settlement.max}`;
    if (settlement.address) textToCopy += `\nАдрес: ${settlement.address}`;
    if (settlement.note) textToCopy += `\nПримечание: ${settlement.note}`;
    
    // Копируем в буфер обмена
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('✅ Данные скопированы!');
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать данные');
    });
}

// Функция показа уведомления
function showNotification(message) {
    let notification = document.querySelector('.copy-notification');
    if (notification) {
        notification.remove();
    }
    
    notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 100);
}

function displayContacts(data) {
    const directory = document.getElementById('directory');
    if (!directory) return;
    
    directory.innerHTML = '';
    
    if (data && data.district && data.settlements) {
        const section = document.createElement('div');
        section.className = 'district-section';
        
        const settlementsHtml = data.settlements.map(settlement => {
            return `
            <div class="settlement-card">
                <div class="settlement-header">
                    <h3>${settlement.name}</h3>
                    <button class="copy-btn" onclick='copyContactData(${JSON.stringify(settlement).replace(/'/g, "&apos;")})'>
                        📋 Копировать
                    </button>
                </div>
                <div class="settlement-body">
                    <div class="info-row">
                        <span class="label">👤 Глава:</span>
                        <span class="value"><strong>${settlement.head}</strong></span>
                    </div>
                    ${settlement.position ? `
                    <div class="info-row">
                        <span class="label">📋 Должность:</span>
                        <span class="value">${settlement.position}</span>
                    </div>` : ''}
                    <div class="info-row">
                        <span class="label">📞 Телефон:</span>
                        <span class="value"><a href="tel:${settlement.phone.replace(/[^0-9+]/g, '')}">${settlement.phone}</a></span>
                    </div>
                    <div class="info-row">
                        <span class="label">✉️ Email:</span>
                        <span class="value"><a href="mailto:${settlement.email}">${settlement.email}</a></span>
                    </div>
                    ${settlement.website ? `
                    <div class="info-row">
                        <span class="label">🌐 Сайт:</span>
                        <span class="value"><a href="${settlement.website}" target="_blank">${settlement.website}</a></span>
                    </div>` : ''}
                    ${settlement.max ? `
                    <div class="info-row">
                        <span class="label">📱 Канал MAX:</span>
                        <span class="value">${settlement.max.includes('http') ? 
                            `<a href="${settlement.max}" target="_blank">${settlement.max}</a>` : 
                            settlement.max}
                        </span>
                    </div>` : ''}
                    ${settlement.address ? `
                    <div class="info-row">
                        <span class="label">🏢 Адрес:</span>
                        <span class="value">${settlement.address}</span>
                    </div>` : ''}
                    ${settlement.note ? `
                    <div class="info-row note">
                        <span class="label">📌 Примечание:</span>
                        <span class="value">${settlement.note}</span>
                    </div>` : ''}
                </div>
            </div>
        `}).join('');
        
        section.innerHTML = `
            <div class="settlements-grid">
                ${settlementsHtml}
            </div>
        `;
        
        directory.appendChild(section);
    }
    else if (Array.isArray(data)) {
        data.forEach(districtData => {
            const section = document.createElement('div');
            section.className = 'district-section';
            
            const settlementsHtml = districtData.settlements.map(settlement => {
                return `
                <div class="settlement-card">
                    <div class="settlement-header">
                        <h3>${settlement.name}</h3>
                        <button class="copy-btn" onclick='copyContactData(${JSON.stringify(settlement).replace(/'/g, "&apos;")})'>
                            📋 Копировать
                        </button>
                    </div>
                    <div class="settlement-body">
                        <div class="info-row">
                            <span class="label">👤 Глава:</span>
                            <span class="value"><strong>${settlement.head}</strong></span>
                        </div>
                        ${settlement.position ? `
                        <div class="info-row">
                            <span class="label">📋 Должность:</span>
                            <span class="value">${settlement.position}</span>
                        </div>` : ''}
                        <div class="info-row">
                            <span class="label">📞 Телефон:</span>
                            <span class="value"><a href="tel:${settlement.phone.replace(/[^0-9+]/g, '')}">${settlement.phone}</a></span>
                        </div>
                        <div class="info-row">
                            <span class="label">✉️ Email:</span>
                            <span class="value"><a href="mailto:${settlement.email}">${settlement.email}</a></span>
                        </div>
                        ${settlement.website ? `
                        <div class="info-row">
                            <span class="label">🌐 Сайт:</span>
                            <span class="value"><a href="${settlement.website}" target="_blank">${settlement.website}</a></span>
                        </div>` : ''}
                        ${settlement.max ? `
                        <div class="info-row">
                            <span class="label">📱 Канал MAX:</span>
                            <span class="value">${settlement.max.includes('http') ? 
                                `<a href="${settlement.max}" target="_blank">${settlement.max}</a>` : 
                                settlement.max}
                            </span>
                        </div>` : ''}
                        ${settlement.address ? `
                        <div class="info-row">
                            <span class="label">🏢 Адрес:</span>
                            <span class="value">${settlement.address}</span>
                        </div>` : ''}
                        ${settlement.note ? `
                        <div class="info-row note">
                            <span class="label">📌 Примечание:</span>
                            <span class="value">${settlement.note}</span>
                        </div>` : ''}
                    </div>
                </div>
            `}).join('');
            
            section.innerHTML = `
                <h2 class="district-title">${districtData.district}</h2>
                <div class="settlements-grid">
                    ${settlementsHtml}
                </div>
            `;
            
            directory.appendChild(section);
        });
    }
}

function filterContacts() {
    if (!allData) return;
    
    const searchText = searchInput.value.toLowerCase();
    
    if (!searchText) {
        displayContacts(allData);
        updateStats(allData);
        return;
    }
    
    if (allData.district && allData.settlements) {
        const filteredSettlements = allData.settlements.filter(settlement => 
            settlement.name.toLowerCase().includes(searchText) ||
            settlement.head.toLowerCase().includes(searchText) ||
            (settlement.position && settlement.position.toLowerCase().includes(searchText)) ||
            (settlement.address && settlement.address.toLowerCase().includes(searchText)) ||
            (settlement.phone && settlement.phone.toLowerCase().includes(searchText)) ||
            (settlement.email && settlement.email.toLowerCase().includes(searchText)) ||
            (settlement.website && settlement.website.toLowerCase().includes(searchText)) ||
            (settlement.max && settlement.max.toLowerCase().includes(searchText))
        );
        
        const filteredData = {
            ...allData,
            settlements: filteredSettlements
        };
        
        displayContacts(filteredData);
        updateStats(filteredData);
    }
    else if (Array.isArray(allData)) {
        const filtered = allData.map(district => ({
            ...district,
            settlements: district.settlements.filter(settlement => 
                settlement.name.toLowerCase().includes(searchText) ||
                settlement.head.toLowerCase().includes(searchText) ||
                (settlement.position && settlement.position.toLowerCase().includes(searchText)) ||
                (settlement.address && settlement.address.toLowerCase().includes(searchText)) ||
                (settlement.phone && settlement.phone.toLowerCase().includes(searchText)) ||
                (settlement.email && settlement.email.toLowerCase().includes(searchText)) ||
                (settlement.website && settlement.website.toLowerCase().includes(searchText)) ||
                (settlement.max && settlement.max.toLowerCase().includes(searchText)) ||
                district.district.toLowerCase().includes(searchText)
            )
        })).filter(district => district.settlements.length > 0);
        
        displayContacts(filtered);
        updateStats(filtered);
    }
}

function updateStats(data) {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    if (data && data.district && data.settlements) {
        stats.innerHTML = `
            <div class="stats-panel">
                <span>🏘️ Поселений: <strong>${data.settlements.length}</strong></span>
                <span>📍 Район: <strong>${data.district}</strong></span>
            </div>
        `;
    }
    else if (Array.isArray(data)) {
        const totalSettlements = data.reduce((sum, district) => 
            sum + (district.settlements?.length || 0), 0);
        
        stats.innerHTML = `
            <div class="stats-panel">
                <span>🏘️ Поселений: <strong>${totalSettlements}</strong></span>
                <span>🗺️ Районов: <strong>${data.length}</strong></span>
            </div>
        `;
    }
}
