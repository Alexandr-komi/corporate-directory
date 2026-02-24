document.addEventListener('DOMContentLoaded', loadData);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterData);
}

let allData = null;
let editMode = false;

// Элементы интерфейса
const editModeBtn = document.getElementById('editModeBtn');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const addCompanyBtn = document.getElementById('addCompanyBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const modal = document.getElementById('modal');
const departmentModal = document.getElementById('departmentModal');
const closeBtns = document.querySelectorAll('.close');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const deptModalCancelBtn = document.getElementById('deptModalCancelBtn');
const employeeForm = document.getElementById('employeeForm');
const departmentForm = document.getElementById('departmentForm');

// Переменные для редактирования
let currentEditCompany = null;
let currentEditDepartment = null;
let currentEditEmployee = null;

// Загрузка данных
async function loadData() {
    const loading = document.getElementById('loading');
    const directory = document.getElementById('directory');
    const stats = document.getElementById('stats');
    
    try {
        const response = await fetch('employees.json');
        if (!response.ok) throw new Error('Файл с данными не найден');
        
        allData = await response.json();
        displayData(allData);
        updateStats(allData);
        loading.style.display = 'none';
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        loading.innerHTML = '❌ Не удалось загрузить данные';
    }
}

// Режим редактирования
editModeBtn.addEventListener('click', () => {
    editMode = true;
    editModeBtn.style.display = 'none';
    saveChangesBtn.style.display = 'inline-block';
    addCompanyBtn.style.display = 'inline-block';
    cancelEditBtn.style.display = 'inline-block';
    displayData(allData);
});

cancelEditBtn.addEventListener('click', () => {
    editMode = false;
    editModeBtn.style.display = 'inline-block';
    saveChangesBtn.style.display = 'none';
    addCompanyBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    displayData(allData);
});

// Сохранение изменений
saveChangesBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('Файл employees.json сохранён. Загрузите его на GitHub через Add file → Upload files');
});

// Добавление предприятия
addCompanyBtn.addEventListener('click', () => {
    const companyName = prompt('Введите название нового предприятия:');
    if (companyName && companyName.trim()) {
        allData.push({
            company: companyName.trim(),
            departments: []
        });
        displayData(allData);
        updateStats(allData);
    }
});

// Закрытие модальных окон
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.style.display = 'none';
        departmentModal.style.display = 'none';
    });
});

modalCancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

deptModalCancelBtn.addEventListener('click', () => {
    departmentModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === departmentModal) {
        departmentModal.style.display = 'none';
    }
});

// Добавление сотрудника
function showAddEmployeeModal(companyName, departmentName) {
    // Заполняем selects
    const companySelect = document.getElementById('empCompany');
    companySelect.innerHTML = '';
    allData.forEach((company, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = company.company;
        if (company.company === companyName) {
            option.selected = true;
        }
        companySelect.appendChild(option);
    });
    
    updateDepartmentSelect(companySelect.value, departmentName);
    
    companySelect.addEventListener('change', () => {
        updateDepartmentSelect(companySelect.value);
    });
    
    document.getElementById('empName').value = '';
    document.getElementById('empPosition').value = '';
    document.getElementById('empPhone').value = '';
    
    document.getElementById('modalTitle').textContent = 'Добавить сотрудника';
    currentEditEmployee = null;
    modal.style.display = 'block';
}

function updateDepartmentSelect(companyIndex, selectedDept = null) {
    const deptSelect = document.getElementById('empDepartment');
    deptSelect.innerHTML = '';
    const company = allData[companyIndex];
    if (company && company.departments) {
        company.departments.forEach((dept, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = dept.name;
            if (dept.name === selectedDept) {
                option.selected = true;
            }
            deptSelect.appendChild(option);
        });
    }
}

// Добавление отдела
function showAddDepartmentModal(companyName) {
    const companySelect = document.getElementById('deptCompany');
    companySelect.innerHTML = '';
    allData.forEach((company, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = company.company;
        if (company.company === companyName) {
            option.selected = true;
        }
        companySelect.appendChild(option);
    });
    
    document.getElementById('deptName').value = '';
    departmentModal.style.display = 'block';
}

// Обработка формы сотрудника
employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const companyIndex = document.getElementById('empCompany').value;
    const deptIndex = document.getElementById('empDepartment').value;
    const name = document.getElementById('empName').value.trim();
    const position = document.getElementById('empPosition').value.trim();
    const phone = document.getElementById('empPhone').value.trim();
    
    const employee = { name, position, phone };
    
    if (currentEditEmployee !== null) {
        // Редактирование существующего
        allData[companyIndex].departments[deptIndex].employees[currentEditEmployee] = employee;
    } else {
        // Добавление нового
        if (!allData[companyIndex].departments[deptIndex].employees) {
            allData[companyIndex].departments[deptIndex].employees = [];
        }
        allData[companyIndex].departments[deptIndex].employees.push(employee);
    }
    
    modal.style.display = 'none';
    displayData(allData);
    updateStats(allData);
});

// Обработка формы отдела
departmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const companyIndex = document.getElementById('deptCompany').value;
    const deptName = document.getElementById('deptName').value.trim();
    
    if (!allData[companyIndex].departments) {
        allData[companyIndex].departments = [];
    }
    
    allData[companyIndex].departments.push({
        name: deptName,
        employees: []
    });
    
    departmentModal.style.display = 'none';
    displayData(allData);
    updateStats(allData);
});

// Отображение данных
function displayData(data) {
    const directory = document.getElementById('directory');
    if (!directory) return;
    
    directory.innerHTML = '';
    
    data.forEach((company, companyIndex) => {
        const companySection = document.createElement('div');
        companySection.className = 'company-section';
        
        // Заголовок предприятия
        const companyHeader = document.createElement('div');
        companyHeader.className = 'company-header';
        companyHeader.innerHTML = `
            <h2>🏢 ${company.company}</h2>
            ${editMode ? `
                <div class="company-actions">
                    <button class="edit-company-btn" data-company="${companyIndex}">✏️</button>
                    <button class="delete-company-btn" data-company="${companyIndex}">🗑️</button>
                    <button class="add-department-btn" data-company="${company.company}">➕ Отдел</button>
                </div>
            ` : ''}
        `;
        companySection.appendChild(companyHeader);
        
        // Отделы
        if (company.departments && company.departments.length > 0) {
            company.departments.forEach((dept, deptIndex) => {
                const deptSection = document.createElement('div');
                deptSection.className = 'department-section';
                
                const deptHeader = document.createElement('div');
                deptHeader.className = 'department-header';
                deptHeader.innerHTML = `
                    <h3>📁 ${dept.name}</h3>
                    ${editMode ? `
                        <div class="department-actions">
                            <button class="edit-dept-btn" data-company="${companyIndex}" data-dept="${deptIndex}">✏️</button>
                            <button class="delete-dept-btn" data-company="${companyIndex}" data-dept="${deptIndex}">🗑️</button>
                            <button class="add-employee-btn" data-company="${company.company}" data-dept="${dept.name}">➕ Сотрудника</button>
                        </div>
                    ` : ''}
                `;
                deptSection.appendChild(deptHeader);
                
                // Сотрудники
                if (dept.employees && dept.employees.length > 0) {
                    const employeesGrid = document.createElement('div');
                    employeesGrid.className = 'employees-grid';
                    
                    dept.employees.forEach((emp, empIndex) => {
                        const empCard = document.createElement('div');
                        empCard.className = 'employee-card';
                        
                        empCard.innerHTML = `
                            <div class="employee-info">
                                <div class="employee-name"><strong>${emp.name}</strong></div>
                                <div class="employee-position">${emp.position}</div>
                                <div class="employee-phone"><a href="tel:${emp.phone.replace(/[^0-9+]/g, '')}">${emp.phone}</a></div>
                            </div>
                            ${editMode ? `
                                <div class="employee-actions">
                                    <button class="edit-emp-btn" data-company="${companyIndex}" data-dept="${deptIndex}" data-emp="${empIndex}">✏️</button>
                                    <button class="delete-emp-btn" data-company="${companyIndex}" data-dept="${deptIndex}" data-emp="${empIndex}">🗑️</button>
                                </div>
                            ` : ''}
                        `;
                        
                        employeesGrid.appendChild(empCard);
                    });
                    
                    deptSection.appendChild(employeesGrid);
                } else if (editMode) {
                    const emptyMessage = document.createElement('p');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = 'Нет сотрудников';
                    deptSection.appendChild(emptyMessage);
                }
                
                companySection.appendChild(deptSection);
            });
        } else if (editMode) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Нет отделов';
            companySection.appendChild(emptyMessage);
        }
        
        directory.appendChild(companySection);
    });
    
    // Добавляем обработчики для кнопок редактирования
    if (editMode) {
        addEditHandlers();
    }
}

// Обработчики кнопок
function addEditHandlers() {
    // Удаление предприятия
    document.querySelectorAll('.delete-company-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            if (confirm('Удалить предприятие и все его отделы?')) {
                allData.splice(companyIndex, 1);
                displayData(allData);
                updateStats(allData);
            }
        });
    });
    
    // Редактирование предприятия
    document.querySelectorAll('.edit-company-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            const newName = prompt('Введите новое название предприятия:', allData[companyIndex].company);
            if (newName && newName.trim()) {
                allData[companyIndex].company = newName.trim();
                displayData(allData);
            }
        });
    });
    
    // Добавление отдела
    document.querySelectorAll('.add-department-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showAddDepartmentModal(e.target.dataset.company);
        });
    });
    
    // Удаление отдела
    document.querySelectorAll('.delete-dept-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            const deptIndex = e.target.dataset.dept;
            if (confirm('Удалить отдел и всех его сотрудников?')) {
                allData[companyIndex].departments.splice(deptIndex, 1);
                displayData(allData);
                updateStats(allData);
            }
        });
    });
    
    // Редактирование отдела
    document.querySelectorAll('.edit-dept-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            const deptIndex = e.target.dataset.dept;
            const newName = prompt('Введите новое название отдела:', allData[companyIndex].departments[deptIndex].name);
            if (newName && newName.trim()) {
                allData[companyIndex].departments[deptIndex].name = newName.trim();
                displayData(allData);
            }
        });
    });
    
    // Добавление сотрудника
    document.querySelectorAll('.add-employee-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showAddEmployeeModal(e.target.dataset.company, e.target.dataset.dept);
        });
    });
    
    // Удаление сотрудника
    document.querySelectorAll('.delete-emp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            const deptIndex = e.target.dataset.dept;
            const empIndex = e.target.dataset.emp;
            if (confirm('Удалить сотрудника?')) {
                allData[companyIndex].departments[deptIndex].employees.splice(empIndex, 1);
                displayData(allData);
                updateStats(allData);
            }
        });
    });
    
    // Редактирование сотрудника
    document.querySelectorAll('.edit-emp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const companyIndex = e.target.dataset.company;
            const deptIndex = e.target.dataset.dept;
            const empIndex = e.target.dataset.emp;
            
            const company = allData[companyIndex];
            const dept = company.departments[deptIndex];
            const emp = dept.employees[empIndex];
            
            // Заполняем форму
            const companySelect = document.getElementById('empCompany');
            companySelect.innerHTML = '';
            allData.forEach((c, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = c.company;
                if (idx == companyIndex) option.selected = true;
                companySelect.appendChild(option);
            });
            
            updateDepartmentSelect(companyIndex, dept.name);
            
            document.getElementById('empName').value = emp.name;
            document.getElementById('empPosition').value = emp.position;
            document.getElementById('empPhone').value = emp.phone;
            
            document.getElementById('modalTitle').textContent = 'Редактировать сотрудника';
            currentEditEmployee = empIndex;
            modal.style.display = 'block';
        });
    });
}

function filterData() {
    if (!allData) return;
    
    const searchText = searchInput.value.toLowerCase();
    
    if (!searchText) {
        displayData(allData);
        updateStats(allData);
        return;
    }
    
    const filtered = allData.map(company => ({
        ...company,
        departments: company.departments.map(dept => ({
            ...dept,
            employees: dept.employees.filter(emp => 
                emp.name.toLowerCase().includes(searchText) ||
                emp.position.toLowerCase().includes(searchText) ||
                dept.name.toLowerCase().includes(searchText) ||
                company.company.toLowerCase().includes(searchText)
            )
        })).filter(dept => dept.employees.length > 0)
    })).filter(company => company.departments.length > 0);
    
    displayData(filtered);
    updateStats(filtered);
}

function updateStats(data) {
    const stats = document.getElementById('stats');
    if (!stats) return;
    
    let totalEmployees = 0;
    let totalDepartments = 0;
    
    data.forEach(company => {
        totalDepartments += company.departments?.length || 0;
        company.departments?.forEach(dept => {
            totalEmployees += dept.employees?.length || 0;
        });
    });
    
    stats.innerHTML = `
        <div class="stats-panel">
            <span>🏢 Предприятий: <strong>${data.length}</strong></span>
            <span>📁 Отделов: <strong>${totalDepartments}</strong></span>
            <span>👥 Сотрудников: <strong>${totalEmployees}</strong></span>
        </div>
    `;
}
