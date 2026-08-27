document.addEventListener('DOMContentLoaded', loadContacts);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterContacts);
}

let allData = null;

// Пароль для показа мобильных телефонов
const MOBILE_PASSWORD = 'mobil2026';

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
    let textToCopy = `${settlement.type ? settlement.type : ''}${settlement.name}\n`;
    textToCopy += `Глава: ${settlement.head}\n`;
    textToCopy += `Телефон: ${settlement.phone}\n`;
    if (settlement.specialist_phone) textToCopy += `Специалисты: ${settlement.specialist_phone}\n`;
    textToCopy += `Email: ${settlement.email}`;
    if (settlement.website) textToCopy += `\nСайт: ${settlement.website}`;
    if (settlement.vk) textToCopy += `\nVK: ${settlement.vk}`;
    if (settlement.max) textToCopy += `\nMAX: ${settlement.max}`;
    if (settlement.address) textToCopy += `\nАдрес: ${settlement.address}`;
    if (settlement.note) textToCopy += `\nПримечание: ${settlement.note}`;
    // Добавляем мобильный, если он есть в данных (даже если скрыт)
    if (settlement.mobile_phone) {
        textToCopy += `\nМобильный: ${settlement.mobile_phone}`;
    }
    
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

// Функция показа мобильного телефона при клике на строку
function showMobilePhone(settlement, element) {
    // Проверяем, не показан ли уже номер
    if (element.dataset.revealed === 'true') {
        return; // Уже показан
    }
    
    // Запрашиваем пароль
    const enteredPassword = prompt('Введите пароль для просмотра мобильного телефона:');
    
    if (enteredPassword === null) {
        return; // Пользователь нажал "Отмена"
    }
    
    if (enteredPassword === MOBILE_PASSWORD) {
        // Пароль верный — заменяем текст на номер
        element.innerHTML = `<span class="label">📱 Мобильный:</span> <span class="value" style="font-size: 18px; font-weight: bold; color: #1e3c72;">${settlement.mobile_phone}</span>`;
        element.style.cursor = 'default';
        element.dataset.revealed = 'true';
        showNotification('✅ Мобильный телефон показан');
    } else {
        alert('❌ Неверный пароль!');
    }
}

function displayContacts(data) {
    const directory = document.getElementById('directory');
    if (!directory) return;
    
    directory.innerHTML = '';
    
    if (data && data.district && data.settlements) {
        const section = document.createElement('div');
        section.className = 'district-section';
        
        const settlementsHtml = data.settlements.map(settlement => {
            const displayName = settlement.type ? `${settlement.type}${settlement.name}` : settlement.name;
            
            // Формируем строку для мобильного телефона, если он есть
            let mobileHtml = '';
            if (settlement.mobile_phone) {
                mobileHtml = `
                    <div class="info-row mobile-phone-row" style="cursor: pointer;" 
                         onclick='showMobilePhone(${JSON.stringify(settlement).replace(/'/g, "&apos;")}, this)'>
                        <span class="label">📱 Показать мобильный</span>
                        <span class="value" style="color: #4dabf7; font-weight: 500;">🔒 нажмите для ввода пароля</span>
                    </div>
                `;
            }
            
            return `
            <div class="settlement-card">
                <div class="settlement-header">
                    <h3>${displayName}</h3>
                    <button class="copy-btn" onclick='copyContactData(${JSON.stringify(settlement).replace(/'/g, "&apos;")})'>
                        📋 Копировать
                    </button>
                </div>
                <div class="settlement-body">
                    <div class="info-row">
                        <span class="label">👤 Глава:</span>
                        <span class="value"><strong>${settlement.head}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="label">📞 Телефон:</span>
                        <span class="value"><a href="tel:${settlement.phone.replace(/[^0-9+]/g, '')}">${settlement.phone}</a></span>
                    </div>
                    ${settlement.specialist_phone ? `
                    <div class="info-row">
                        <span class="label">👥 Специалисты:</span>
                        <span class="value"><a href="tel:${settlement.specialist_phone.replace(/[^0-9+]/g, '')}">${settlement.specialist_phone}</a></span>
                    </div>` : ''}
                    <div class="info-row">
                        <span class="label">✉️ Email:</span>
                        <span class="value"><a href="mailto:${settlement.email}">${settlement.email}</a></span>
                    </div>
                    ${settlement.website ? `
                    <div class="info-row">
                        <span class="label">🌐 Сайт:</span>
                        <span class="value"><a href="${settlement.website}" target="_blank">${settlement.website}</a></span>
                    </div>` : ''}
                    ${settlement.vk ? `
                    <div class="info-row">
                        <span class="label">📱 VK:</span>
                        <span class="value"><a href="${settlement.vk}" target="_blank">${settlement.vk}</a></span>
                    </div>` : ''}
                    ${settlement.max ? `
                    <div class="info-row">
                        <span class="label">💬 MAX:</span>
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
                    ${mobileHtml}
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
                const displayName = settlement.type ? `${settlement.type}${settlement.name}` : settlement.name;
                
                let mobileHtml = '';
                if (settlement.mobile_phone) {
                    mobileHtml = `
                        <div class="info-row mobile-phone-row" style="cursor: pointer;" 
                             onclick='showMobilePhone(${JSON.stringify(settlement).replace(/'/g, "&apos;")}, this)'>
                            <span class="label">📱 Показать мобильный</span>
                            <span class="value" style="color: #4dabf7; font-weight: 500;">🔒 нажмите для ввода пароля</span>
                        </div>
                    `;
                }
                
                return `
                <div class="settlement-card">
                    <div class="settlement-header">
                        <h3>${displayName}</h3>
                        <button class="copy-btn" onclick='copyContactData(${JSON.stringify(settlement).replace(/'/g, "&apos;")})'>
                            📋 Копировать
                        </button>
                    </div>
                    <div class="settlement-body">
                        <div class="info-row">
                            <span class="label">👤 Глава:</span>
                            <span class="value"><strong>${settlement.head}</strong></span>
                        </div>
                        <div class="info-row">
                            <span class="label">📞 Телефон:</span>
                            <span class="value"><a href="tel:${settlement.phone.replace(/[^0-9+]/g, '')}">${settlement.phone}</a></span>
                        </div>
                        ${settlement.specialist_phone ? `
                        <div class="info-row">
                            <span class="label">👥 Специалисты:</span>
                            <span class="value"><a href="tel:${settlement.specialist_phone.replace(/[^0-9+]/g, '')}">${settlement.specialist_phone}</a></span>
                        </div>` : ''}
                        <div class="info-row">
                            <span class="label">✉️ Email:</span>
                            <span class="value"><a href="mailto:${settlement.email}">${settlement.email}</a></span>
                        </div>
                        ${settlement.website ? `
                        <div class="info-row">
                            <span class="label">🌐 Сайт:</span>
                            <span class="value"><a href="${settlement.website}" target="_blank">${settlement.website}</a></span>
                        </div>` : ''}
                        ${settlement.vk ? `
                        <div class="info-row">
                            <span class="label">📱 VK:</span>
                            <span class="value"><a href="${settlement.vk}" target="_blank">${settlement.vk}</a></span>
                        </div>` : ''}
                        ${settlement.max ? `
                        <div class="info-row">
                            <span class="label">💬 MAX:</span>
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
                        ${mobileHtml}
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
            (settlement.address && settlement.address.toLowerCase().includes(searchText)) ||
            (settlement.phone && settlement.phone.toLowerCase().includes(searchText)) ||
            (settlement.specialist_phone && settlement.specialist_phone.toLowerCase().includes(searchText)) ||
            (settlement.email && settlement.email.toLowerCase().includes(searchText)) ||
            (settlement.website && settlement.website.toLowerCase().includes(searchText)) ||
            (settlement.vk && settlement.vk.toLowerCase().includes(searchText)) ||
            (settlement.max && settlement.max.toLowerCase().includes(searchText)) ||
            (settlement.type && settlement.type.toLowerCase().includes(searchText)) ||
            (settlement.mobile_phone && settlement.mobile_phone.toLowerCase().includes(searchText))
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
                (settlement.address && settlement.address.toLowerCase().includes(searchText)) ||
                (settlement.phone && settlement.phone.toLowerCase().includes(searchText)) ||
                (settlement.specialist_phone && settlement.specialist_phone.toLowerCase().includes(searchText)) ||
                (settlement.email && settlement.email.toLowerCase().includes(searchText)) ||
                (settlement.website && settlement.website.toLowerCase().includes(searchText)) ||
                (settlement.vk && settlement.vk.toLowerCase().includes(searchText)) ||
                (settlement.max && settlement.max.toLowerCase().includes(searchText)) ||
                (settlement.type && settlement.type.toLowerCase().includes(searchText)) ||
                (settlement.mobile_phone && settlement.mobile_phone.toLowerCase().includes(searchText)) ||
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
