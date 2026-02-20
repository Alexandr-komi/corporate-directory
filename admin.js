let currentData = null;
let githubToken = '';
let fileSha = '';

document.getElementById('loginBtn').onclick = async function() {
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
            throw new Error('Ошибка доступа');
        }
        
        const data = await response.json();
        fileSha = data.sha;
        const content = atob(data.content);
        currentData = JSON.parse(content);
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        
        showEditor();
        
    } catch (error) {
        document.getElementById('loginError').textContent = error.message;
    }
};

function showEditor() {
    let html = '<h3>Редактор отделов</h3>';
    
    for (let i = 0; i < currentData.departments.length; i++) {
        const dept = currentData.departments[i];
        
        // Заголовок отдела
        html += `<div style="border:1px solid #ccc; margin:10px; padding:10px; background:#f9f9f9;">`;
        html += `<div style="display:flex; gap:5px; margin-bottom:10px; align-items:center;">`;
        html += `<input type="text" id="dept_name_${i}" value="${escapeHTML(dept.name)}" style="width:300px; padding:5px;" placeholder="Название отдела">`;
        html += `<button onclick="moveUp(${i})" ${i === 0 ? 'disabled' : ''}>↑</button>`;
        html += `<button onclick="moveDown(${i})" ${i === currentData.departments.length - 1 ? 'disabled' : ''}>↓</button>`;
        html += `<button onclick="deleteDept(${i})" style="background:#ff4444; color:white;">Удалить отдел</button>`;
        html += `</div>`;
        
        // Контакты
        if (dept.contacts && dept.contacts.length > 0) {
            for (let j = 0; j < dept.contacts.length; j++) {
                const c = dept.contacts[j];
                html += `<div style="margin-left:20px; margin-bottom:10px; padding:5px; background:white; border:1px solid #ddd;">`;
                html += `<div style="display:flex; gap:5px; flex-wrap:wrap;">`;
                html += `<input type="text" id="contact_name_${i}_${j}" value="${escapeHTML(c.name || '')}" placeholder="ФИО" style="width:200px; padding:3px;">`;
                html += `<input type="text" id="contact_position_${i}_${j}" value="${escapeHTML(c.position || '')}" placeholder="Должность" style="width:200px; padding:3px;">`;
                html += `<input type="text" id="contact_phone_${i}_${j}" value="${escapeHTML(c.phone || '')}" placeholder="Телефон" style="width:150px; padding:3px;">`;
                html += `<input type="email" id="contact_email_${i}_${j}" value="${escapeHTML(c.email || '')}" placeholder="Email" style="width:200px; padding:3px;">`;
                html += `<button onclick="deleteContact(${i}, ${j})" style="background:#ff4444; color:white;">×</button>`;
                html += `</div>`;
                html += `</div>`;
            }
        }
        
        html += `<button onclick="addContact(${i})" style="margin-left:20px; margin-top:5px;">+ Добавить контакт</button>`;
        html += `</div>`;
    }
    
    html += `<button onclick="addDept()" style="margin-top:10px;">+ Добавить отдел</button>`;
    
    document.getElementById('editor').innerHTML = html;
}

function addDept() {
    currentData.departments.push({
        name: 'Новый отдел',
        contacts: []
    });
    showEditor();
}

function addContact(i) {
    if (!currentData.departments[i].contacts) {
        currentData.departments[i].contacts = [];
    }
    currentData.departments[i].contacts.push({
        name: '',
        position: '',
        phone: '',
        email: ''
    });
    showEditor();
}

function deleteContact(i, j) {
    if (confirm('Удалить контакт?')) {
        currentData.departments[i].contacts.splice(j, 1);
        showEditor();
    }
}

function deleteDept(i) {
    if (confirm('Удалить отдел?')) {
        currentData.departments.splice(i, 1);
        showEditor();
    }
}

function moveUp(i) {
    if (i > 0) {
        let temp = currentData.departments[i];
        currentData.departments[i] = currentData.departments[i-1];
        currentData.departments[i-1] = temp;
        showEditor();
    }
}

function moveDown(i) {
    if (i < currentData.departments.length - 1) {
        let temp = currentData.departments[i];
        currentData.departments[i] = currentData.departments[i+1];
        currentData.departments[i+1] = temp;
        showEditor();
    }
}

document.getElementById('saveDataBtn').onclick = async function() {
    // Собираем данные из полей ввода
    for (let i = 0; i < currentData.departments.length; i++) {
        let nameInput = document.getElementById(`dept_name_${i}`);
        if (nameInput) currentData.departments[i].name = nameInput.value;
        
        if (currentData.departments[i].contacts) {
            for (let j = 0; j < currentData.departments[i].contacts.length; j++) {
                let nameInput = document.getElementById(`contact_name_${i}_${j}`);
                let positionInput = document.getElementById(`contact_position_${i}_${j}`);
                let phoneInput = document.getElementById(`contact_phone_${i}_${j}`);
                let emailInput = document.getElementById(`contact_email_${i}_${j}`);
                
                if (nameInput) currentData.departments[i].contacts[j].name = nameInput.value;
                if (positionInput) currentData.departments[i].contacts[j].position = positionInput.value;
                if (phoneInput) currentData.departments[i].contacts[j].phone = phoneInput.value;
                if (emailInput) currentData.departments[i].contacts[j].email = emailInput.value;
            }
        }
    }
    
    document.getElementById('saveStatus').textContent = 'Сохранение...';
    
    try {
        const jsonString = JSON.stringify(currentData, null, 2);
        const content = btoa(unescape(encodeURIComponent(jsonString)));
        
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + githubToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Обновление справочника (добавлен email)',
                content: content,
                sha: fileSha
            })
        });
        
        if (response.ok) {
            document.getElementById('saveStatus').textContent = '✅ Сохранено!';
            const data = await response.json();
            fileSha = data.content.sha;
            setTimeout(() => {
                document.getElementById('saveStatus').textContent = '';
            }, 3000);
        } else {
            document.getElementById('saveStatus').textContent = '❌ Ошибка сохранения';
        }
    } catch (e) {
        document.getElementById('saveStatus').textContent = '❌ Ошибка';
    }
};

document.getElementById('loadDataBtn').onclick = async function() {
    await loadData();
};

async function loadData() {
    try {
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: {
                'Authorization': 'token ' + githubToken
            }
        });
        
        const data = await response.json();
        fileSha = data.sha;
        const content = atob(data.content);
        currentData = JSON.parse(content);
        
        showEditor();
        
    } catch (e) {
        alert('Ошибка загрузки: ' + e.message);
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}