let departments = [];
let githubToken = '';
let fileSha = '';

document.getElementById('loginBtn').addEventListener('click', async function() {
    const token = document.getElementById('tokenInput').value;
    if (!token) {
        document.getElementById('loginError').textContent = 'Введите токен';
        return;
    }
    
    githubToken = token;
    
    try {
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: { 'Authorization': 'token ' + token }
        });
        
        if (response.status === 404) {
            departments = [];
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'block';
            renderEditor();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Ошибка доступа. Проверьте токен.');
        }
        
        const data = await response.json();
        fileSha = data.sha;
        const content = atob(data.content);
        const jsonData = JSON.parse(content);
        departments = jsonData.departments || [];
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        renderEditor();
        
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
    }
});

function renderEditor() {
    const editor = document.getElementById('departmentsEditor');
    let html = '';
    
    for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        
        html += `<div class="department-editor" data-index="${i}">`;
        html += `<div class="department-title">`;
        html += `<input type="text" value="${escapeHTML(dept.name || '')}" placeholder="Название отдела" onchange="updateDepartmentName(${i}, this.value)">`;
        html += `<button class="btn move-btn" onclick="moveDepartment(${i}, 'up')" ${i === 0 ? 'disabled' : ''}>↑</button>`;
        html += `<button class="btn move-btn" onclick="moveDepartment(${i}, 'down')" ${i === departments.length - 1 ? 'disabled' : ''}>↓</button>`;
        html += `<button class="btn delete-btn" onclick="deleteDepartment(${i})">×</button>`;
        html += `</div>`;
        html += `<div class="contacts-editor">`;
        
        if (dept.contacts && dept.contacts.length > 0) {
            for (let j = 0; j < dept.contacts.length; j++) {
                const c = dept.contacts[j];
                html += `<div class="contact-editor">`;
                html += `<input type="text" value="${escapeHTML(c.name || '')}" placeholder="ФИО" onchange="updateContact(${i}, ${j}, 'name', this.value)">`;
                html += `<input type="text" value="${escapeHTML(c.position || '')}" placeholder="Должность" onchange="updateContact(${i}, ${j}, 'position', this.value)">`;
                html += `<input type="text" value="${escapeHTML(c.phone || '')}" placeholder="Телефон" onchange="updateContact(${i}, ${j}, 'phone', this.value)">`;
                html += `<input type="email" value="${escapeHTML(c.email || '')}" placeholder="Email" onchange="updateContact(${i}, ${j}, 'email', this.value)">`;
                html += `<button class="btn delete-btn" onclick="deleteContact(${i}, ${j})">×</button>`;
                html += `</div>`;
            }
        }
        
        html += `</div>`;
        html += `<button class="btn add-contact-btn" onclick="addContact(${i})">+ Добавить контакт</button>`;
        html += `</div>`;
    }
    
    editor.innerHTML = html;
}

function updateDepartmentName(index, newName) {
    departments[index].name = newName;
}

function updateContact(deptIndex, contactIndex, field, value) {
    if (!departments[deptIndex].contacts) {
        departments[deptIndex].contacts = [];
    }
    if (!departments[deptIndex].contacts[contactIndex]) {
        departments[deptIndex].contacts[contactIndex] = {};
    }
    departments[deptIndex].contacts[contactIndex][field] = value;
}

function deleteContact(deptIndex, contactIndex) {
    if (confirm('Удалить контакт?')) {
        departments[deptIndex].contacts.splice(contactIndex, 1);
        renderEditor();
    }
}

function addContact(deptIndex) {
    if (!departments[deptIndex].contacts) {
        departments[deptIndex].contacts = [];
    }
    departments[deptIndex].contacts.push({
        name: '',
        position: '',
        phone: '',
        email: ''
    });
    renderEditor();
}

document.getElementById('addDepartmentBtn').addEventListener('click', function() {
    departments.push({
        name: 'Новый отдел',
        contacts: []
    });
    renderEditor();
});

function moveDepartment(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= departments.length) return;
    
    const dept = departments[index];
    departments.splice(index, 1);
    departments.splice(newIndex, 0, dept);
    renderEditor();
}

function deleteDepartment(index) {
    if (confirm('Удалить отдел?')) {
        departments.splice(index, 1);
        renderEditor();
    }
}

document.getElementById('saveToGithubBtn').addEventListener('click', async function() {
    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = '⏳ Сохранение...';
    
    try {
        for (let i = 0; i < departments.length; i++) {
            let nameInput = document.querySelector(`.department-editor[data-index="${i}"] .department-title input`);
            if (nameInput) departments[i].name = nameInput.value;
            
            if (departments[i].contacts) {
                let contactEditors = document.querySelectorAll(`.department-editor[data-index="${i}"] .contact-editor`);
                contactEditors.forEach((editor, j) => {
                    let inputs = editor.querySelectorAll('input');
                    if (inputs.length >= 4) {
                        departments[i].contacts[j].name = inputs[0].value;
                        departments[i].contacts[j].position = inputs[1].value;
                        departments[i].contacts[j].phone = inputs[2].value;
                        departments[i].contacts[j].email = inputs[3].value;
                    }
                });
            }
        }
        
        const dataToSave = { departments: departments };
        
        // САМЫЙ НАДЁЖНЫЙ СПОСОБ КОДИРОВАНИЯ
        const jsonString = JSON.stringify(dataToSave, null, 2);
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        
        let url = 'https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json';
        let body = {
            message: 'Обновление справочника',
            content: base64
        };
        
        if (fileSha) {
            body.sha = fileSha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + githubToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            statusEl.textContent = '✅ Сохранено!';
            const data = await response.json();
            fileSha = data.content.sha;
            setTimeout(() => { statusEl.textContent = ''; }, 3000);
        } else {
            throw new Error('Ошибка сохранения');
        }
        
    } catch (error) {
        console.error(error);
        statusEl.textContent = '❌ Ошибка';
    }
});

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
