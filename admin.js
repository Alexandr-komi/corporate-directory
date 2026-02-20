let currentData = null;
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
            headers: {
                'Authorization': 'token ' + token
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка доступа. Проверьте токен.');
        }
        
        const data = await response.json();
        fileSha = data.sha;
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
        html += `
            <div class="department-editor" data-index="${i}">
                <div class="department-title">
                    <input type="text" value="${escapeHTML(dept.name)}" 
                           placeholder="Название отдела" 
                           onchange="updateDepartmentName(${i}, this.value)">
                    <button class="btn move-btn" onclick="moveDepartment(${i}, 'up')" 
                            ${i === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn move-btn" onclick="moveDepartment(${i}, 'down')"
                            ${i === currentData.departments.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="btn delete-btn" onclick="deleteDepartment(${i})">×</button>
                </div>
                <div class="contacts-editor" id="contacts-${i}">
        `;
        
        if (dept.contacts && dept.contacts.length > 0) {
            for (let j = 0; j < dept.contacts.length; j++) {
                const c = dept.contacts[j];
                html += `
                    <div class="contact-editor">
                        <input type="text" value="${escapeHTML(c.name || '')}" 
                               placeholder="ФИО" style="width: 200px;"
                               onchange="updateContact(${i}, ${j}, 'name', this.value)">
                        <input type="text" value="${escapeHTML(c.position || '')}" 
                               placeholder="Должность" style="width: 200px;"
                               onchange="updateContact(${i}, ${j}, 'position', this.value)">
                        <input type="text" value="${escapeHTML(c.phone || '')}" 
                               placeholder="Телефон" style="width: 150px;"
                               onchange="updateContact(${i}, ${j}, 'phone', this.value)">
                        <input type="email" value="${escapeHTML(c.email || '')}" 
                               placeholder="Email" style="width: 200px;"
                               onchange="updateContact(${i}, ${j}, 'email', this.value)">
                        <button class="btn delete-btn" onclick="deleteContact(${i}, ${j})">×</button>
                    </div>
                `;
            }
        }
        
        html += `
                </div>
                <button class="btn add-contact-btn" onclick="addContact(${i})">+ Добавить контакт</button>
            </div>
        `;
    }
    
    editor.innerHTML = html;
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
    if (confirm('Удалить контакт?')) {
        currentData.departments[deptIndex].contacts.splice(contactIndex, 1);
        renderEditor();
    }
}

function addContact(deptIndex) {
    if (!currentData.departments[deptIndex].contacts) {
        currentData.departments[deptIndex].contacts = [];
    }
    currentData.departments[deptIndex].contacts.push({
        name: '',
        position: '',
        phone: '',
        email: ''
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
        // Собираем данные из полей ввода (на случай если что-то не сохранилось через onchange)
        for (let i = 0; i < currentData.departments.length; i++) {
            let nameInput = document.querySelector(`.department-editor[data-index="${i}"] .department-title input`);
            if (nameInput) currentData.departments[i].name = nameInput.value;
            
            if (currentData.departments[i].contacts) {
                let contactEditors = document.querySelectorAll(`.department-editor[data-index="${i}"] .contact-editor`);
                contactEditors.forEach((editor, j) => {
                    let inputs = editor.querySelectorAll('input');
                    if (inputs.length >= 4) {
                        currentData.departments[i].contacts[j].name = inputs[0].value;
                        currentData.departments[i].contacts[j].position = inputs[1].value;
                        currentData.departments[i].contacts[j].phone = inputs[2].value;
                        currentData.departments[i].contacts[j].email = inputs[3].value;
                    }
                });
            }
        }
        
        const jsonString = JSON.stringify(currentData, null, 2);
        const content = btoa(unescape(encodeURIComponent(jsonString)));
        
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + githubToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Обновление справочника через админку',
                content: content,
                sha: fileSha
            })
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
        statusEl.textContent = '❌ Ошибка сохранения';
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