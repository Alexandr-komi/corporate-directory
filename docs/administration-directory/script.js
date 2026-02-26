document.addEventListener('DOMContentLoaded', loadData);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterData);
}

let allData = null;

async function loadData() {
    const loading = document.getElementById('loading');
    const directory = document.getElementById('directory');
    const stats = document.getElementById('stats');
    const addressEl = document.getElementById('address');
    
    try {
        const response = await fetch('employees.json');
        if (!response.ok) throw new Error('Файл с данными не найден');
        
        allData = await response.json();
        
        // Отображаем адрес
        if (allData.address) {
            addressEl.textContent = `📍 ${allData.address}`;
        }
        
        displayDepartments(allData.departments);
        updateStats(allData.departments);
        loading.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loading.innerHTML = '❌ Не удалось загрузить данные';
    }
}

function displayDepartments(departments) {
    const directory = document.getElementById('directory');
    if (!directory) return;
    
    directory.innerHTML = '';
    
    departments.forEach((dept, index) => {
        const deptSection = document.createElement('div');
        deptSection.className = 'department-section';
        
        // Заголовок отдела (кликабельный)
        const deptHeader = document.createElement('div');
        deptHeader.className = 'department-header';
        deptHeader.innerHTML = `
            <h3>
                <span>📁 ${dept.name}</span>
                ${dept.address ? `<span style="font-size: 12px; opacity: 0.9; margin-left: 10px;">📍 ${dept.address}</span>` : ''}
            </h3>
            <span class="toggle-icon">▼</span>
        `;
        
        // Контент отдела (изначально скрыт)
        const deptContent = document.createElement('div');
        deptContent.className = 'department-content';
        
        // Сетка карточек сотрудников
        const employeesGrid = document.createElement('div');
        employeesGrid.className = 'employees-grid';
        
        if (dept.employees && dept.employees.length > 0) {
            dept.employees.forEach(emp => {
                // Показываем только если есть имя или телефон
                if (emp.name || emp.phone) {
                    const empCard = document.createElement('div');
                    empCard.className = 'employee-card';
                    
                    let cardHtml = '';
                    
                    // Должность
                    if (emp.position) {
                        cardHtml += `<div class="employee-position">${emp.position}</div>`;
                    }
                    
                    // Имя (жирное)
                    if (emp.name) {
                        cardHtml += `<div class="employee-name"><strong>${emp.name}</strong></div>`;
                    } else if (!emp.name && emp.phone) {
                        cardHtml += `<div class="employee-name"><strong>Сотрудник</strong></div>`;
                    }
                    
                    // Телефон
                    if (emp.phone) {
                        // Форматируем телефон для ссылки (оставляем только цифры и +)
                        const phoneLink = emp.phone.replace(/[^0-9+]/g, '');
                        cardHtml += `
                            <div class="employee-phone">
                                <span class="phone-icon">📞</span>
                                <a href="tel:${phoneLink}">${emp.phone}</a>
                            </div>
                        `;
                    } else {
                        cardHtml += `
                            <div class="employee-phone">
                                <span class="phone-icon">📞</span>
                                <span style="color: #adb5bd;">нет телефона</span>
                            </div>
                        `;
                    }
                    
                    empCard.innerHTML = cardHtml;
                    employeesGrid.appendChild(empCard);
                }
            });
        }
        
        // Если после фильтрации остались сотрудники
        if (employeesGrid.children.length > 0) {
            deptContent.appendChild(employeesGrid);
        } else {
            // Показываем сообщение, если нет сотрудников
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Нет сотрудников';
            deptContent.appendChild(emptyMessage);
        }
        
        deptSection.appendChild(deptHeader);
        deptSection.appendChild(deptContent);
        directory.appendChild(deptSection);
        
        // Добавляем обработчик клика для открытия/закрытия
        deptHeader.addEventListener('click', () => {
            const isOpen = deptContent.classList.contains('open');
            const icon = deptHeader.querySelector('.toggle-icon');
            
            if (isOpen) {
                deptContent.classList.remove('open');
                icon.classList.remove('open');
                icon.textContent = '▼';
            } else {
                deptContent.classList.add('open');
                icon.classList.add('open');
                icon.textContent = '▲';
            }
        });
    });
}

function filterData() {
    if (!allData) return;
    
    const searchText = searchInput.value.toLowerCase().trim();
    
    if (!searchText) {
        // Если поиск пустой, показываем все отделы закрытыми
        displayDepartments(allData.departments);
        updateStats(allData.departments);
        
        // Закрываем все отделы
        setTimeout(() => {
            document.querySelectorAll('.department-content').forEach(content => {
                content.classList.remove('open');
            });
            document.querySelectorAll('.toggle-icon').forEach(icon => {
                icon.classList.remove('open');
                icon.textContent = '▼';
            });
        }, 100);
        return;
    }
    
    // Фильтруем отделы и сотрудников
    const filteredDepartments = allData.departments.map(dept => ({
        ...dept,
        employees: dept.employees.filter(emp => 
            (emp.name && emp.name.toLowerCase().includes(searchText)) ||
            (emp.position && emp.position.toLowerCase().includes(searchText)) ||
            (emp.phone && emp.phone.toLowerCase().includes(searchText)) ||
            (dept.name && dept.name.toLowerCase().includes(searchText))
        )
    })).filter(dept => dept.employees.length > 0);
    
    displayDepartments(filteredDepartments);
    updateStats(filteredDepartments);
    
    // При поиске автоматически открываем все отделы с результатами
    setTimeout(() => {
        document.querySelectorAll('.department-section').forEach((section, index) => {
            const content = section.querySelector('.department-content');
            const icon = section.querySelector('.toggle-icon');
            if (content && filteredDepartments[index]?.employees.length > 0) {
                content.classList.add('open');
                icon.classList.add('open');
                icon.textContent = '▲';
            }
        });
    }, 100);
}

function updateStats(departments) {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    let totalEmployees = 0;
    departments.forEach(dept => {
        totalEmployees += dept.employees?.length || 0;
    });
    
    stats.innerHTML = `
        <div class="stats-panel">
            <span>📁 Отделов: <strong>${departments.length}</strong></span>
            <span>👥 Сотрудников: <strong>${totalEmployees}</strong></span>
        </div>
    `;
}
