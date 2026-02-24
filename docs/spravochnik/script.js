// Хранилище данных
const STORAGE_KEY = 'admin_contacts';
let contacts = [];

// Константа организации (одна на весь справочник)
const ORGANIZATION = 'Администрация Корткеросского района';

// Список отделов
const DEPARTMENTS = [
    'Руководство',
    'Орготдел',
    'IT-отдел',
    'УКС',
    'Жилполитика'
];

// Элементы DOM
const directoryContainer = document.getElementById('directoryContainer');
const loadingEl = document.getElementById('loading');
const modal = document.getElementById('modal');
const showFormBtn = document.getElementById('showFormBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const contactForm = document.getElementById('contactForm');
const formTitle = document.getElementById('formTitle');
const editId = document.getElementById('editId');

// Состояние свернуто/развернуто для отделов
let expandedDepts = new Set();

// Загрузка данных
function loadContacts() {
    showLoading(true);
    setTimeout(function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                contacts = JSON.parse(stored);
            } else {
                // Пример данных
                contacts = [
                    { 
                        id: Date.now() + 1, 
                        fullname: 'Иванов Иван Иванович', 
                        position: 'Глава района', 
                        department: 'Руководство',
                        phone: '+7 (821) 212-34-56', 
                        email: 'i.ivanov@kortkeros.ru' 
                    },
                    { 
                        id: Date.now() + 2, 
                        fullname: 'Петрова Мария Сергеевна', 
                        position: 'Начальник отдела', 
                        department: 'Орготдел',
                        phone: '+7 (821) 212-34-57', 
                        email: 'm.petrova@kortkeros.ru' 
                    },
                    { 
                        id: Date.now() + 3, 
                        fullname: 'Сидоров Петр Николаевич', 
                        position: 'Системный администратор', 
                        department: 'IT-отдел',
                        phone: '+7 (821) 212-34-58', 
                        email: 'p.sidorov@kortkeros.ru' 
                    }
                ];
                saveContacts();
            }
            renderDirectory();
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            directoryContainer.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
        } finally {
            showLoading(false);
        }
    }, 500);
}

function showLoading(isLoading) {
    if (loadingEl) {
        loadingEl.style.display = isLoading ? 'block' : 'none';
    }
    if (directoryContainer) {
        directoryContainer.style.display = isLoading ? 'none' : 'block';
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

// Получить сотрудников отдела
function getEmployeesByDepartment(department) {
    return contacts.filter(c => c.department === department)
        .sort((a, b) => a.fullname.localeCompare(b.fullname));
}

// Рендер справочника
function renderDirectory() {
    if (!directoryContainer) return;
    
    if (contacts.length === 0) {
        directoryContainer.innerHTML = '<p class="empty-message">Справочник пуст. Добавьте первого сотрудника!</p>';
        return;
    }

    let html = '<div class="directory-container">';

    DEPARTMENTS.forEach(dept => {
        const isExpanded = expandedDepts.has(dept);
        const icon = isExpanded ? '▼' : '▶';
        const employees = getEmployeesByDepartment(dept);
        
        html += '<div class="department-section">';
        html += `<div class="dept-header ${!isExpanded ? 'collapsed' : ''}" data-dept="${escapeHtml(dept)}">`;
        html += `<span>📁 ${escapeHtml(dept)} (${employees.length})</span>`;
        html += `<span class="toggle-icon">${icon}</span>`;
        html += '</div>';

        if (isExpanded) {
            html += '<div class="employees-container">';
            
            if (employees.length === 0) {
                html += '<p class="empty-message">Нет сотрудников в отделе</p>';
            } else {
                employees.forEach(emp => {
                    html += '<div class="employee-card" data-id="' + emp.id + '">';
                    html += '<div class="employee-actions">';
                    html += `<button class="edit-btn" onclick="editContact(${emp.id})">✏️ Ред</button>`;
                    html += `<button class="delete-btn" onclick="deleteContact(${emp.id})">🗑️ Уд</button>`;
                    html += '</div>';
                    html += '<div class="employee-name">' + escapeHtml(emp.fullname) + '</div>';
                    html += '<div class="employee-position">' + escapeHtml(emp.position || 'Должность не указана') + '</div>';
                    html += '<div class="employee-contact"><strong>📞</strong> ' + escapeHtml(emp.phone || '—') + '</div>';
                    html += '<div class="employee-contact"><strong>✉️</strong> ' + escapeHtml(emp.email || '—') + '</div>';
                    html += '</div>';
                });
            }
            
            html += '</div>'; // закрываем employees-container
        }
        
        html += '</div>'; // закрываем department-section
    });

    html += '</div>';
    directoryContainer.innerHTML = html;
}

// Обработчик кликов на отделы
document.addEventListener('click', function(e) {
    const deptHeader = e.target.closest('.dept-header');
    if (deptHeader) {
        const dept = deptHeader.dataset.dept;
        if (expandedDepts.has(dept)) {
            expandedDepts.delete(dept);
        } else {
            expandedDepts.add(dept);
        }
        renderDirectory();
    }
});

// Функции для кнопок
window.editContact = function(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        document.getElementById('fullname').value = contact.fullname || '';
        document.getElementById('position').value = contact.position || '';
        document.getElementById('department').value = contact.department || '';
        document.getElementById('phone').value = contact.phone || '';
        document.getElementById('email').value = contact.email || '';
        document.getElementById('editId').value = contact.id;
        formTitle.textContent = '✏️ Редактировать сотрудника';
        openModal();
    }
};

window.deleteContact = function(id) {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
        contacts = contacts.filter(c => c.id !== id);
        saveContacts();
        renderDirectory();
    }
};

// Управление модальным окном
function openModal() {
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = 'none';
    }
    contactForm.reset();
    editId.value = '';
    formTitle.textContent = '➕ Добавить сотрудника';
}

// Обработчики событий
if (showFormBtn) {
    showFormBtn.addEventListener('click', function() {
        closeModal(); // сброс формы
        openModal();
    });
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

        const id = editId.value ? parseInt(editId.value) : Date.now();
        const fullname = document.getElementById('fullname').value.trim();
        const position = document.getElementById('position').value.trim();
        const department = document.getElementById('department').value;
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!fullname) {
            alert('Поле "ФИО" обязательно для заполнения');
            return;
        }

        if (!department) {
            alert('Выберите отдел');
            return;
        }

        const contactData = {
            id: id,
            fullname: fullname,
            position: position,
            department: department,
            phone: phone,
            email: email
        };

        if (editId.value) {
            // Редактирование
            const index = contacts.findIndex(c => c.id === parseInt(editId.value));
            if (index !== -1) {
                contacts[index] = contactData;
            }
        } else {
            // Добавление
            contacts.push(contactData);
        }

        saveContacts();
        renderDirectory();
        closeModal();
    });
}

// Старт приложения
loadContacts();
