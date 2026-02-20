// Основной массив для хранения контактов
let contacts = [];

// Загружаем контакты из localStorage при запуске
function loadContacts() {
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    } else {
        // Несколько контактов для примера, если список пуст
        contacts = [
            { fullName: 'Иван Иванов', position: 'Менеджер', organization: 'ООО "Ромашка"', city: 'Москва', phone: '+7 (123) 456-78-90', email: 'ivan@example.com' },
            { fullName: 'Петр Петров', position: 'Разработчик', organization: 'АО "ТехноПрогресс"', city: 'Санкт-Петербург', phone: '+7 (987) 654-32-10', email: 'petr@example.com' },
        ];
    }
    displayContacts(contacts);
}

// Сохраняем контакты в localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Отображаем контакты на странице
function displayContacts(contactsToDisplay) {
    const list = document.getElementById('contactsList');
    if (!contactsToDisplay || contactsToDisplay.length === 0) {
        list.innerHTML = '<p class="loading">Контакты не найдены</p>';
        return;
    }

    let html = '';
    contactsToDisplay.forEach(contact => {
        html += `
            <div class="contact-card">
                <h3>${escapeHTML(contact.fullName)}</h3>
                <div class="position">${escapeHTML(contact.position) || ''}</div>
                <div class="organization">${escapeHTML(contact.organization) || ''}</div>
                <div class="city">📍 ${escapeHTML(contact.city) || ''}</div>
                <div class="phone">📞 ${escapeHTML(contact.phone) || ''}</div>
                <div class="email">✉️ <a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email) || ''}</a></div>
            </div>
        `;
    });
    list.innerHTML = html;
}

// Простая защита от XSS (если кто-то введет HTML-код)
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

// Функция для фильтрации контактов при поиске
function filterContacts(searchTerm) {
    if (!searchTerm) {
        displayContacts(contacts);
        return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(contact => {
        return contact.fullName.toLowerCase().includes(term) ||
               (contact.position && contact.position.toLowerCase().includes(term)) ||
               (contact.organization && contact.organization.toLowerCase().includes(term));
    });
    displayContacts(filtered);
}

// --- Обработчики событий (когда страница загружена) ---
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();

    const modal = document.getElementById('contactModal');
    const addBtn = document.getElementById('addContactBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const form = document.getElementById('contactForm');
    const searchInput = document.getElementById('searchInput');

    // Открыть модальное окно
    addBtn.onclick = function() {
        modal.style.display = 'block';
        form.reset(); // Очистить форму
    };

    // Закрыть модальное окно (по кнопке Отмена)
    cancelBtn.onclick = function() {
        modal.style.display = 'none';
    };

    // Закрыть модальное окно (клик вне окна)
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Обработка отправки формы (сохранение нового контакта)
    form.onsubmit = function(e) {
        e.preventDefault(); // Остановить перезагрузку страницы

        const newContact = {
            fullName: document.getElementById('fullName').value,
            position: document.getElementById('position').value,
            organization: document.getElementById('organization').value,
            city: document.getElementById('city').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
        };

        contacts.push(newContact);
        saveContacts();
        displayContacts(contacts); // Показать все контакты, включая новый
        modal.style.display = 'none'; // Закрыть окно
    };

    // Обработка поиска
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterContacts(this.value);
        });
    }
});