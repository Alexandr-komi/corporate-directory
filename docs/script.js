document.addEventListener('DOMContentLoaded', loadContacts);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterContacts);
}

let allContacts = [];

async function loadContacts() {
    const loading = document.getElementById('loading');
    const directory = document.getElementById('directory');
    const stats = document.getElementById('stats');
    
    try {
        const response = await fetch('contacts.json');
        if (!response.ok) throw new Error('Файл с контактами не найден');
        
        allContacts = await response.json();
        displayContacts(allContacts);
        updateStats(allContacts);
        loading.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loading.innerHTML = '❌ Не удалось загрузить контакты';
    }
}

function displayContacts(data) {
    const directory = document.getElementById('directory');
    if (!directory) return;
    
    directory.innerHTML = '';
    
    data.forEach(districtData => {
        const section = document.createElement('div');
        section.className = 'district-section';
        
        const settlementsHtml = districtData.settlements.map(settlement => `
            <div class="settlement-card">
                <div class="settlement-header">
                    <h3>${settlement.name}</h3>
                    <span class="settlement-type">${settlement.type}</span>
                </div>
                <div class="settlement-body">
                    <div class="info-row">
                        <span class="label">👤 Глава:</span>
                        <span class="value">${settlement.head}</span>
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
                    ${settlement.note ? `
                    <div class="info-row note">
                        <span class="label">📌 Примечание:</span>
                        <span class="value">${settlement.note}</span>
                    </div>` : ''}
                </div>
            </div>
        `).join('');
        
        section.innerHTML = `
            <h2 class="district-title">${districtData.district}</h2>
            <div class="settlements-grid">
                ${settlementsHtml}
            </div>
        `;
        
        directory.appendChild(section);
    });
}

function filterContacts() {
    const searchText = searchInput.value.toLowerCase();
    
    if (!searchText) {
        displayContacts(allContacts);
        updateStats(allContacts);
        return;
    }
    
    const filtered = allContacts.map(district => ({
        ...district,
        settlements: district.settlements.filter(settlement => 
            settlement.name.toLowerCase().includes(searchText) ||
            settlement.head.toLowerCase().includes(searchText) ||
            (settlement.position && settlement.position.toLowerCase().includes(searchText)) ||
            district.district.toLowerCase().includes(searchText)
        )
    })).filter(district => district.settlements.length > 0);
    
    displayContacts(filtered);
    updateStats(filtered);
}

function updateStats(data) {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    const totalSettlements = data.reduce((sum, district) => 
        sum + district.settlements.length, 0);
    
    stats.innerHTML = `
        <div class="stats-panel">
            <span>🏘️ Всего поселений: <strong>${totalSettlements}</strong></span>
            <span>🗺️ Районов: <strong>${data.length}</strong></span>
        </div>
    `;
}