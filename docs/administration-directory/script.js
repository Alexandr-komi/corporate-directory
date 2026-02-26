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
            <h3>📁 ${dept.name} ${dept.address ? `<span style="font-size: 12px; color: #6c757d; margin-left: 10px;">📍 ${dept.address}</span>` : ''}</h3>
            <span class="toggle-icon">▼</span>
        `;
        
        // Контент отдела (изначально скрыт)
        const deptContent = document.createElement('div');
        deptContent.className = 'department-content';
        
        // Список сотрудников
        const employeesList = document.createElement('div');
        employeesList.className = 'employees-list';
        
        if (dept.employees && dept.employees.length > 0) {
            dept.employees.forEach(emp => {
                if (emp.name || emp.phone) { // Показываем только если есть имя или телефон
                    const empItem = document.createElement('div');
                    empItem.className = 'employee-item';
                    
                    let empHtml = '<div class="employee-info">';
                    if (emp.position) empHtml += `<div class="employee-position">${emp.position}</div>`;
                    if (emp.name) empHtml += `<div class="employee-name">${emp.name}</div>`;
                    empHtml += '</div>';
                    
                    if (emp.phone) {
                        // Форматируем телефон для ссылки
                        const phoneLink = emp.phone.replace(/[^0-9+]/g, '');
                        empHtml += `<div class="employee-phone"><a href="tel:${phoneLink}">${emp.phone}</a></div>`;
                    } else {
                        empHtml += `<div class="employee-phone"></div>`;
                    }
                    
                    empItem.innerHTML = empHtml;
                    employeesList.appendChild(empItem);
                }
            });
        } else {
            employeesList.innerHTML = '<p style="color: #adb5bd; font-style: italic; padding: 10px;">Нет данных</p>';
        }
        
        deptContent.appendChild(employeesList);
        deptSection.appendChild(deptHeader);
        deptSection.appendChild(deptContent);
        directory.appendChild(deptSection);
        
        // Добавляем обработчик клика для открытия/закрытия
        deptHeader.addEventListener('click', () => {
            const isOpen = deptContent.classList.contains('open');
            const icon = deptHeader.querySelector('.toggle-icon');
            
            if (isOpen) {
                deptContent.classList.remove('open');
                icon.textContent = '▼';
            } else {
                deptContent.classList.add('open');
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
                if (icon) icon.textContent = '▲';
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
