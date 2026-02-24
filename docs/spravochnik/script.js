// Используем localStorage для хранения контактов
const STORAGE_KEY = 'corporate_directory_contacts';

let contacts = [];

// Элементы DOM
const contactListEl = document.getElementById('contactList');
const loadingEl = document.getElementById('loading');
const modal = document.getElementById('modal');
const showFormBtn = document.getElementById('showFormBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const contactForm = document.getElementById('contactForm');
const formTitle = document.getElementById('formTitle');

// Загрузка контактов при старте
function loadContacts() {
    showLoading(true);
    setTimeout(function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                contacts = JSON.parse(stored);
            } else {
                // Начальные данные для примера
                contacts = [
                    { 
                        id: Date.now() + 1, 
                        fullname: 'Иванов Иван Иванович', 
                        position: 'Генеральный директор', 
                        organization: 'Администрация', 
                        department: 'орготдел',
                        city: 'Москва', 
                        phone: '+7 (495) 123-45-67', 
                        email: 'i.ivanov@example.com' 
                    },
                    { 
                        id: Date.now() + 2, 
                        fullname: 'Петрова Мария Сергеевна', 
                        position: 'Главный бухгалтер', 
                        organization: 'Управление культуры', 
                        department: 'Опека',
                        city: 'Санкт-Петербург', 
                        phone: '+7 (812) 765-43-21', 
                        email: 'm.petrova@example.com' 
                    }
                ];
                saveContacts();
            }
            renderContacts();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            contactListEl.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function showLoading(isLoading) {
    if (loadingEl) {
        loadingEl.style.display = isLoading ? 'block' : 'none';
    }
    if (contactListEl) {
        contactListEl.style.display = isLoading ? 'none' : 'grid';
    }
}

function saveContacts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function escapeHtml(unsafe) {
    if (!unsafe) return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderContacts() {
    if (!contactListEl) return;
    
    if (contacts.length === 0) {
        contactListEl.innerHTML = '<p class="empty-message">Справочник пуст. Добавьте первый контакт!</p>';
        return;
    }

    let html = '';
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        html += '<div class="contact-card" data-id="' + contact.id + '">';
        html += '<div class="contact-name">' + escapeHtml(contact.fullname) + '</div>';
        html += '<div class="contact-detail"><strong>Должность:</strong> <span>' + escapeHtml(contact.position || '—') + '</span></div>';
        html += '<div class="contact-detail"><strong>Организация:</strong> <span>' + escapeHtml(contact.organization || '—') + '</span></div>';
        html += '<div class="contact-detail"><strong>Отдел:</strong> <span>' + escapeHtml(contact.department || '—') + '</span></div>';
        html += '<div class="contact-detail"><strong>Нас. пункт:</strong> <span>' + escapeHtml(contact.city || '—') + '</span></div>';
        html += '<div class="contact-detail"><strong>Телефон:</strong> <span>' + escapeHtml(contact.phone || '—') + '</span></div>';
        html += '<div class="contact-detail"><strong>Email:</strong> <span>' + escapeHtml(contact.email || '—') + '</span></div>';
        html += '</div>';
    }
    contactListEl.innerHTML = html;
}

// Управление модальным окном
function openModal() {
    if (modal) {
        modal.style.display = 'flex';
    }
    if (contactForm) {
        contactForm.reset();
    }
    if (formTitle) {
        formTitle.textContent = '➕ Добавить новый контакт';
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Обработчики событий
if (showFormBtn) {
    showFormBtn.addEventListener('click', openModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
}

// Закрытие по клику вне модального окна
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Обработка отправки формы
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullname = document.getElementById('fullname') ? document.getElementById('fullname').value.trim() : '';
        const position = document.getElementById('position') ? document.getElementById('position').value.trim() : '';
        const organization = document.getElementById('organization') ? document.getElementById('organization').value : '';
        const department = document.getElementById('department') ? document.getElementById('department').value : '';
        const city = document.getElementById('city') ? document.getElementById('city').value.trim() : '';
        const phone = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';

        if (!fullname) {
            alert('Поле "ФИО" обязательно для заполнения');
            return;
        }

        const newContact = {
            id: Date.now(),
            fullname: fullname,
            position: position,
            organization: organization,
            department: department,
            city: city,
            phone: phone,
            email: email
        };

        contacts.push(newContact);
        saveContacts();
        renderContacts();
        closeModal();
    });
}

// Старт приложения
loadContacts();
