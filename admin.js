let token = '';
let currentData = null;
let fileSha = '';

document.getElementById('loginBtn').onclick = async function() {
    token = document.getElementById('tokenInput').value;
    if (!token) {
        document.getElementById('loginError').textContent = 'Введите токен';
        return;
    }
    
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    
    await loadData();
};

async function loadData() {
    try {
        const response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: {
                'Authorization': 'token ' + token
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

function showEditor() {
    let html = '<h3>Редактор отделов</h3>';
    
    for (let i = 0; i < currentData.departments.length; i++) {
        const dept = currentData.departments[i];
        html += `<div style="border:1px solid #ccc; margin:10px; padding:10px;">`;
        html += `<input type="text" id="dept_name_${i}" value="${dept.name.replace(/"/g, '&quot;')}" style="width:300px">`;
        html += `<button onclick="moveUp(${i})">↑</button>`;
        html += `<button onclick="moveDown(${i})">↓</button>`;
        html += `<button onclick="deleteDept(${i})">Удалить отдел</button>`;
        
        if (dept.contacts && dept.contacts.length > 0) {
            for (let j = 0; j < dept.contacts.length; j++) {
                const c = dept.contacts[j];
                html += `<div style="margin-left:20px; margin-top:5px">`;
                html += `<input type="text" id="contact_name_${i}_${j}" value="${(c.name || '').replace(/"/g, '&quot;')}" placeholder="Имя">`;
                html += `<input type="text" id="contact_phone_${i}_${j}" value="${(c.phone || '').replace(/"/g, '&quot;')}" placeholder="Телефон">`;
                html += `<button onclick="deleteContact(${i}, ${j})">×</button>`;
                html += `</div>`;
            }
        }
        
        html += `<button onclick="addContact(${i})" style="margin-left:20px">+ Добавить контакт</button>`;
        html += `</div>`;
    }
    
    html += `<button onclick="addDept()">+ Добавить отдел</button>`;
    
    document.getElementById('editor').innerHTML = html;
}

function addDept() {
    currentData.departments.push({name: 'Новый отдел', contacts: []});
    showEditor();
}

function addContact(i) {
    if (!currentData.departments[i].contacts) {
        currentData.departments[i].contacts = [];
    }
    currentData.departments[i].contacts.push({name: '', phone: ''});
    showEditor();
}

function deleteContact(i, j) {
    currentData.departments[i].contacts.splice(j, 1);
    showEditor();
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
                let phoneInput = document.getElementById(`contact_phone_${i}_${j}`);
                if (nameInput) currentData.departments[i].contacts[j].name = nameInput.value;
                if (phoneInput) currentData.departments[i].contacts[j].phone = phoneInput.value;
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
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Обновление справочника',
                content: content,
                sha: fileSha
            })
        });
        
        if (response.ok) {
            document.getElementById('saveStatus').textContent = 'Сохранено!';
            const data = await response.json();
            fileSha = data.content.sha;
        } else {
            document.getElementById('saveStatus').textContent = 'Ошибка!';
        }
    } catch (e) {
        document.getElementById('saveStatus').textContent = 'Ошибка!';
    }
};

document.getElementById('loadDataBtn').onclick = loadData;