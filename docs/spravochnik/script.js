// Хранилище данных
const STORAGE_KEY = 'corporate_directory_contacts';
let contacts = [];

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

// Состояние свернуто/развернуто
let expandedOrgs = new Set();
let expandedDepts = new Map(); // ключ: "орг-депт"

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
                        position: 'Генеральный директор', 
                        organization: 'Администрация', 
                        department: 'Орготдел',
                        phone: '+7 (495) 123-45-67', 
                        email: 'i.ivanov@example.com' 
                    },
                    { 
                        id: Date.now() + 2, 
                        fullname: 'Петрова Мария Сергеевна', 
                        position: 'Главный бухгалтер', 
                        organization: 'Управление Культуры', 
                        department: 'Опека',
                        phone: '+7 (812) 765-43-21', 
                        email: 'm.petrova@example.com' 
                    },
                    { 
                        id: Date.now() + 3, 
                        fullname: 'Сидоров Петр Николаевич', 
                        position: 'Начальник отдела', 
                        organization: 'Администрация', 
                        department: 'Управление Имущества',
                        phone: '+7 (495) 111-22-33', 
                        email: 'p.sidorov@example.com' 
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

// Получить уникальные организации
function getOrganizations() {
    const orgs = new Set();
    contacts.forEach(c => {
        if (c.organization) orgs.add(c.organization);
    });
    return Array.from(orgs).sort();
}

// Получить отделы для организации
function getDepartments(organization) {
    const depts = new Set();
    contacts.forEach(c => {
        if (c.organization === organization && c.department) {
            depts.add(c.department);
        }
    });
    return Array.from(depts).sort();
}

// Получить сотрудников отдела
function getEmployees(organization, department) {
    return contacts.filter(c => 
        c.organization === organization && 
        c.department === department
    ).sort((a, b) => a.fullname.localeCompare(b.fullname));
}

// Рендер всего справочника
function renderDirectory() {
    if (!directoryContainer) return;
    
    if (contacts.length === 0) {
        directoryContainer.innerHTML = '<p class="empty-message">Справочник пуст. Добавьте первого сотрудника!</p>';
        return;
    }

    const organizations = getOrganizations();
    let html = '<div class="directory-container">';

    organizations.forEach(org => {
        const isOrgExpanded = expandedOrgs.has(org);
        const orgIcon = isOrgExpanded ? '▼' : '▶';
        
        html += '<div class="organization-item">';
        html += `<div class="org-header ${!isOrgExpanded ? 'collapsed' : ''}" data-org="${escapeHtml(org)}">`;
        html += `<span>🏢 ${escapeHtml(org)}</span>`;
        html += `<span class="toggle-icon">${orgIcon}</span>`;
        html += '</div>';

        if (isOrgExpanded) {
            const departments = getDepartments(org);
            html += '<div class="departments-container">';
            
            if (departments.length === 0) {
                html += '<p class="empty-message">Нет отделов</p>';
            } else {
                departments.forEach(dept => {
                    const deptKey = org + '|' + dept;
                    const isDeptExpanded = expandedDepts.has(deptKey);
                    const deptIcon = isDeptExpanded ? '▼' : '▶';
                    
                    html += '<div class="department-item">';
                    html += `<div class="dept-header ${!isDeptExpanded ? 'collapsed' : ''}" data-org="${escapeHtml(org)}" data-dept="${escapeHtml(dept)}">`;
                    html += `<span>📁 ${escapeHtml(dept)}</span>`;
                    html += `<span class="toggle-icon">${deptIcon}</span>`;
                    html += '</div>';

                    if (isDeptExpanded) {
                        const employees = getEmployees(org, dept);
                        html += '<div class="employees-container">';
                        
                        if (employees.length === 0) {
                            html += '<p class="empty-message">Нет сотрудников</p>';
                        } else {
                            employees.forEach(emp => {
                                html += '<div class="employee-card" data-id="' + emp.id + '">';
                                html += '<div class="employee-actions">';
                                html += `<button class="edit-btn" onclick="editContact(${emp.id})">✏️</button>`;
                                html += `<button class="delete-btn" onclick="deleteContact(${emp.id})">🗑️</button>`;
                                html += '</div>';
                                html += '<div class="employee-name">' + escapeHtml(emp.fullname) + '</div>';
                                html += '<div class="employee-position">' + escapeHtml(emp.position || '—') + '</div>';
                                html += '<div class="employee-contact"><strong>📞</strong> ' + escapeHtml(emp.phone || '—') + '</div>';
                                html += '<div class="employee-contact"><strong>✉️</strong> ' + escapeHtml(emp.email || '—') + '</div>';
                                html += '</div>';
                            });
                        }
                        
                        html += '</div>'; // закрываем employees-container
                    }
                    
                    html += '</div>'; // закрываем department-item
                });
            }
            
            html += '</div>'; // закрываем departments-container
        }
        
        html += '</div>'; // закрываем organization-item
    });

    html += '</div>';
    directoryContainer.innerHTML = html;
}

// Обработчики кликов на организацию/отдел
document.addEventListener('click', function(e) {
    // Клик по организации
    const orgHeader = e.target.closest('.org-header');
    if (orgHeader) {
        const org = orgHeader.dataset.org;
        if (expandedOrgs.has(org)) {
            expandedOrgs.delete(org);
        } else {
            expandedOrgs.add(org);
        }
        renderDirectory();
        return;
    }

    // Клик по отделу
    const deptHeader = e.target.closest('.dept-header');
    if (deptHeader) {
        const org = deptHeader.dataset.org;
        const dept = deptHeader.dataset.dept;
        const deptKey = org + '|' + dept;
        
        if (expandedDepts.has(deptKey)) {
            expandedDepts.delete(deptKey);
        } else {
            expandedDepts.add(deptKey);
        }
        renderDirectory();
        return;
    }
});

// Функции для кнопок (должны быть в глобальной области видимости)
window.editContact = function(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        document.getElementById('fullname').value = contact.fullname || '';
        document.getElementById('position').value = contact.position || '';
        document.getElementById('organization').value = contact.organization || '';
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
        const organization = document.getElementById('organization').value;
        const department = document.getElementById('department').value;
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!fullname) {
            alert('Поле "ФИО" обязательно для заполнения');
            return;
        }

        if (!organization) {
            alert('Выберите организацию');
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
            organization: organization,
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
