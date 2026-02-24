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
    setTimeout(() => { // Имитация загрузки
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                contacts = JSON.parse(stored);
            } else {
                // Начальные данные для примера
                contacts = [
                    { id: Date.now() + 1, fullname: 'Иванов Иван Иванович', position: 'Генеральный директор', organization: 'ООО "Ромашка"', city: 'Москва', phone: '+7 (495) 123-45-67', email: 'i.ivanov@example.com' },
                    { id: Date.now() + 2, fullname: 'Петрова Мария Сергеевна', position: 'Главный бухгалтер', organization: 'АО "ТехноПром"', city: 'Санкт-Петербург', phone: '+7 (812) 765-43-21', email: 'm.petrova@example.com' }
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
    loadingEl.style.display = isLoading ? 'block' : 'none';
    contactListEl.style.display = isLoading ? 'none' : 'grid';
}

function saveContacts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function renderContacts() {
    if (contacts.length === 0) {
        contactListEl.innerHTML = '<p class="empty-message">Справочник пуст. Добавьте первый контакт!</p>';
        return;
    }

    contactListEl.innerHTML = contacts.map(contact => `
        <div class="contact-card" data-id="${contact.id}">
            <div class="contact-name">${escapeHtml(contact.fullname)}</div>
            <div class="contact-detail"><strong>Должность:</strong> <span>${escapeHtml(contact.position || '—')}</span></div>
            <div class="contact-detail"><strong>Организация:</strong> <span>${escapeHtml(contact.organization || '—')}</span></div>
            <div class="contact-detail"><strong>Нас. пункт:</strong> <span>${escapeHtml(contact.city || '—')}</span></div>
            <div class="contact-detail"><strong>Телефон:</strong> <span>${escapeHtml(contact.phone || '—')}</span></div>
            <div class="contact-detail"><strong>Email:</strong> <span>${escapeHtml(contact.email || '—')}</span></div>
        </div>
    `).join('');
}

// Простая защита от XSS
function escapeHtml(unsafe) {
    if (!unsafe) return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Управление модальным окном
function openModal() {
    modal.style.display = 'flex';
    contactForm.reset();
    formTitle.textContent = '➕ Добавить новый контакт';
}

function closeModal() {
    modal.style.display = 'none';
}

showFormBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Закрытие по клику вне модального окна
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Обработка отправки формы
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const newContact = {
        id: Date.now(), // Простой способ получить уникальный id
        fullname: formData.get('fullname').trim(),
        position: formData.get('position').trim(),
        organization: formData.get('organization').trim(),
        city: formData.get('city').trim(),
        phone: formData.get('phone').trim(),
        email: formData.get('email').trim()
    };

    if (!newContact.fullname) {
        alert('Поле "ФИО" обязательно для заполнения');
        return;
    }

    contacts.push(newContact);
    saveContacts();
    renderContacts();
    closeModal();
});

// Старт приложения
loadContacts();
