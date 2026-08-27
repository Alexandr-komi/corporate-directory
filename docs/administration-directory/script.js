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
    
    const departmentsGrid = document.createElement('div');
    departmentsGrid.className = 'departments-grid';
    
    departments.forEach((dept, index) => {
        const validEmployees = dept.employees.filter(emp => emp.name && emp.name.trim() !== '');
        
        const deptCard = document.createElement('div');
        deptCard.className = 'department-card';
        
        const deptHeader = document.createElement('div');
        deptHeader.className = 'department-header';
        
        // Формируем структуру заголовка
        let titleHtml = `
            <div class="department-title-wrapper">
                <div class="department-name-row">
                    <span class="department-name">${dept.name}</span>
        `;
        
        if (dept.address) {
            titleHtml += `<span class="department-address">📍 ${dept.address}</span>`;
        }
        
        titleHtml += `</div>`;
        
        // Контакты: сайт слева, почта справа (в одной строке)
        if (dept.email || dept.site) {
            titleHtml += `
                <div class="department-contact-row">
                    ${dept.site ? `
                        <div class="department-site-block">
                            <a href="${dept.site}" target="_blank" title="Официальная страница отдела">
                                🌐 Официальная страница
                            </a>
                        </div>
                    ` : ''}
                    ${dept.email ? `
                        <div class="department-email-block">
                            <span class="email-icon">📧</span>
                            <a href="mailto:${dept.email}">${dept.email}</a>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        titleHtml += `</div>`;
        
        deptHeader.innerHTML = titleHtml + `<span class="toggle-icon">▼</span>`;
        
        const deptContent = document.createElement('div');
        deptContent.className = 'department-content';
        
        const employeesGrid = document.createElement('div');
        employeesGrid.className = 'employees-grid';
        
        if (validEmployees.length > 0) {
            validEmployees.forEach(emp => {
                const empCard = document.createElement('div');
                empCard.className = 'employee-card';
                
                const isManager = ['Начальник', 'Заместитель начальника', 'Заведующий отделом', 'Заместитель заведующего', 'Руководитель', 'Заведующий'].some(
                    role => emp.position && emp.position.includes(role)
                );
                
                if (isManager) {
                    empCard.classList.add('manager');
                }
                
                let cardHtml = '<div class="employee-row">';
                
                if (emp.position) {
                    cardHtml += `<span class="employee-position">${emp.position}</span>`;
                } else {
                    cardHtml += `<span class="employee-position">—</span>`;
                }
                
                if (emp.phone && emp.phone.trim() !== '') {
                    const phoneClean = emp.phone.replace(/[^\d]/g, '');
                    cardHtml += `
                        <span class="employee-phone">
                            📞 <a href="tel:${phoneClean}">${emp.phone}</a>
                        </span>
                    `;
                }
                
                cardHtml += '</div>';
                
                if (emp.name) {
                    cardHtml += `<div class="employee-name">${emp.name}</div>`;
                }
                
                empCard.innerHTML = cardHtml;
                employeesGrid.appendChild(empCard);
            });
        }
        
        if (employeesGrid.children.length > 0) {
            deptContent.appendChild(employeesGrid);
        }
        
        deptCard.appendChild(deptHeader);
        deptCard.appendChild(deptContent);
        departmentsGrid.appendChild(deptCard);
        
        deptHeader.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                return;
            }
            
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
    
    directory.appendChild(departmentsGrid);
}

function filterData() {
    if (!allData) return;
    
    const searchText = searchInput.value.toLowerCase().trim();
    
    if (!searchText) {
        displayDepartments(allData.departments);
        updateStats(allData.departments);
        
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
    
    const filteredDepartments = allData.departments.map(dept => ({
        ...dept,
        employees: dept.employees.filter(emp => 
            emp.name && emp.name.trim() !== '' && (
                (emp.name && emp.name.toLowerCase().includes(searchText)) ||
                (emp.position && emp.position.toLowerCase().includes(searchText)) ||
                (emp.phone && emp.phone.toLowerCase().includes(searchText)) ||
                (dept.name && dept.name.toLowerCase().includes(searchText)) ||
                (dept.email && dept.email.toLowerCase().includes(searchText)) ||
                (dept.site && dept.site.toLowerCase().includes(searchText))
            )
        )
    })).filter(dept => dept.employees.length > 0);
    
    displayDepartments(filteredDepartments);
    updateStats(filteredDepartments);
    
    setTimeout(() => {
        document.querySelectorAll('.department-card').forEach((card, index) => {
            const content = card.querySelector('.department-content');
            const icon = card.querySelector('.toggle-icon');
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
        totalEmployees += dept.employees.filter(emp => emp.name && emp.name.trim() !== '').length || 0;
    });
    
    stats.innerHTML = `
        <div class="stats-panel">
            <span>📁 Отделов: <strong>${departments.length}</strong></span>
            <span>👥 Сотрудников: <strong>${totalEmployees}</strong></span>
        </div>
    `;
}
