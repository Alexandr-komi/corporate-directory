let currentData = null;
let githubToken = '';

document.getElementById('loginBtn').addEventListener('click', async function() {
    const token = document.getElementById('tokenInput').value;
    if (!token) {
        document.getElementById('loginError').textContent = 'Введите токен';
        return;
    }
    
    githubToken = token;
    
    try {
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: {
                'Authorization': 'token ' + token,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка доступа. Проверьте токен.');
        }
        
        const data = await response.json();
        const content = atob(data.content);
        currentData = JSON.parse(content);
        
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
    
    for (let i = 0; i < currentData.departments.length; i++) {
        const dept = currentData.departments[i];
        html += '<div class="department-editor" data-index="' + i + '">';
        html += '<div class="department-title">';
        html += '<input type="text" value="' + escapeHTML(dept.name) + '" placeholder="Название отдела" onchange="updateDepartmentName(' + i + ', this.value)">';
        html += '<button class="btn move-btn" onclick="moveDepartment(' + i + ', \'up\')"' + (i === 0 ? ' disabled' : '') + '>↑</button>';
        html += '<button class="btn move-btn" onclick="moveDepartment(' + i + ', \'down\')"' + (i === currentData.departments.length - 1 ? ' disabled' : '') + '>↓</button>';
        html += '<button class="btn delete-btn" onclick="deleteDepartment(' + i + ')">×</button>';
        html += '</div>';
        html += '<div class="contacts-editor" id="contacts-' + i + '">';
        html += renderContactsEditor(i);
        html += '</div>';
        html += '<button class="btn add-contact-btn" onclick="addContact(' + i + ')">+ Добавить контакт</button>';
        html += '</div>';
    }
    
    editor.innerHTML = html;
}

function renderContactsEditor(deptIndex) {
    const contacts = currentData.departments[deptIndex].contacts || [];
    let html = '';
    
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        html += '<div class="contact-editor">';
        html += '<input type="text" value="' + escapeHTML(contact.name || '') + '" placeholder="ФИО / Название" onchange="updateContact(' + deptIndex + ', ' + i + ', \'name\', this.value)">';
        html += '<input type="text" value="' + escapeHTML(contact.position || '') + '" placeholder="Должность / Описание" onchange="updateContact(' + deptIndex + ', ' + i + ', \'position\', this.value)">';
        html += '<input type="text" value="' + escapeHTML(contact.phone || '') + '" placeholder="Телефон" onchange="updateContact(' + deptIndex + ', ' + i + ', \'phone\', this.value)">';
        html += '<button class="btn delete-btn" onclick="deleteContact(' + deptIndex + ', ' + i + ')">×</button>';
        html += '</div>';
    }
    
    return html;
}

function updateDepartmentName(index, newName) {
    currentData.departments[index].name = newName;
}

function updateContact(deptIndex, contactIndex, field, value) {
    if (!currentData.departments[deptIndex].contacts) {
        currentData.departments[deptIndex].contacts = [];
    }
    if (!currentData.departments[deptIndex].contacts[contactIndex]) {
        currentData.departments[deptIndex].contacts[contactIndex] = {};
    }
    currentData.departments[deptIndex].contacts[contactIndex][field] = value;
}

function deleteContact(deptIndex, contactIndex) {
    currentData.departments[deptIndex].contacts.splice(contactIndex, 1);
    renderEditor();
}

function addContact(deptIndex) {
    if (!currentData.departments[deptIndex].contacts) {
        currentData.departments[deptIndex].contacts = [];
    }
    currentData.departments[deptIndex].contacts.push({
        name: '',
        position: '',
        phone: ''
    });
    renderEditor();
}

function moveDepartment(index, direction) {
    let newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentData.departments.length) return;
    
    let dept = currentData.departments[index];
    currentData.departments.splice(index, 1);
    currentData.departments.splice(newIndex, 0, dept);
    renderEditor();
}

function deleteDepartment(index) {
    if (confirm('Удалить отдел?')) {
        currentData.departments.splice(index, 1);
        renderEditor();
    }
}

document.getElementById('addDepartmentBtn').addEventListener('click', function() {
    currentData.departments.push({
        name: 'Новый отдел',
        contacts: []
    });
    renderEditor();
});

document.getElementById('saveToGithubBtn').addEventListener('click', async function() {
    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = 'Сохранение...';
    
    try {
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: {
                'Authorization': 'token ' + githubToken,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const fileData = await response.json();
        const sha = fileData.sha;
        
        let jsonString = JSON.stringify(currentData, null, 2);
        let content = btoa(unescape(encodeURIComponent(jsonString)));
        
        const saveResponse = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + githubToken,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Обновление справочника через админку',
                content: content,
                sha: sha
            })
        });
        
        if (saveResponse.ok) {
            statusEl.textContent = 'Сохранено!';
            setTimeout(function() { statusEl.textContent = ''; }, 3000);
        } else {
            throw new Error('Ошибка сохранения');
        }
        
    } catch (error) {
        statusEl.textContent = 'Ошибка сохранения';
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