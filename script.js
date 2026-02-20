// Загружаем данные из data.json
async function loadDirectory() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        displayDirectory(data);
    } catch (error) {
        document.getElementById('directoryContainer').innerHTML = 
            '<p class="loading">Ошибка загрузки справочника</p>';
    }
}

// Отображаем справочник
function displayDirectory(data) {
    const container = document.getElementById('directoryContainer');
    let html = '';
    
    data.departments.forEach((dept, index) => {
        html += `
            <div class="department" data-department-index="${index}">
                <div class="department-header" onclick="toggleDepartment(${index})">
                    <h2>${escapeHTML(dept.name)}</h2>
                    <span class="toggle-icon" id="toggle-${index}">▼</span>
                </div>
                <div class="contacts-list" id="dept-${index}">
                    ${renderContacts(dept.contacts)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Отображаем контакты отдела
function renderContacts(contacts) {
    if (!contacts || contacts.length === 0) {
        return '<p>Нет контактов</p>';
    }
    
    return contacts.map(contact => `
        <div class="contact-card">
            <div class="name">${escapeHTML(contact.name || '')}</div>
            <div class="position">${escapeHTML(contact.position || '')}</div>
            <div class="phone">📞 ${escapeHTML(contact.phone || '')}</div>
        </div>
    `).join('');
}

// Сворачиваем/разворачиваем отдел
function toggleDepartment(index) {
    const list = document.getElementById(`dept-${index}`);
    const toggle = document.getElementById(`toggle-${index}`);
    
    if (list.style.display === 'none') {
        list.style.display = 'grid';
        toggle.textContent = '▼';
    } else {
        list.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// Поиск по справочнику
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const departments = document.querySelectorAll('.department');
    
    departments.forEach(dept => {
        const cards = dept.querySelectorAll('.contact-card');
        let hasVisibleContacts = false;
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                card.style.display = 'block';
                hasVisibleContacts = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Показываем отдел, если есть видимые контакты
        if (hasVisibleContacts || searchTerm === '') {
            dept.style.display = 'block';
        } else {
            dept.style.display = 'none';
        }
    });
});

// Защита от XSS
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Загружаем справочник при открытии страницы
loadDirectory();