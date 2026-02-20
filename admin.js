let departments = [];
let githubToken = '';
let fileSha = '';

document.getElementById('loginBtn').onclick = async function() {
    let token = document.getElementById('tokenInput').value;
    if (!token) {
        document.getElementById('loginError').innerText = 'Введите токен';
        return;
    }
    githubToken = token;
    
    try {
        let response = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            headers: {'Authorization': 'token ' + token}
        });
        
        if (response.status === 404) {
            departments = [];
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'block';
            renderEditor();
            return;
        }
        
        let data = await response.json();
        fileSha = data.sha;
        let content = atob(data.content);
        departments = JSON.parse(content).departments || [];
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        renderEditor();
        
    } catch (e) {
        document.getElementById('loginError').innerText = 'Ошибка';
    }
};

function renderEditor() {
    let html = '';
    for (let i = 0; i < departments.length; i++) {
        let dept = departments[i];
        html += '<div style="border:2px solid #3498db; margin:10px; padding:15px;">';
        html += '<div><input id="dept_name_'+i+'" value="'+(dept.name||'')+'" style="width:400px"></div>';
        html += '<div><button onclick="moveUp('+i+')">↑</button>';
        html += '<button onclick="moveDown('+i+')">↓</button>';
        html += '<button onclick="deleteDept('+i+')">Удалить отдел</button></div>';
        
        if (dept.contacts) {
            for (let j = 0; j < dept.contacts.length; j++) {
                let c = dept.contacts[j];
                html += '<div style="margin:5px 0 5px 20px; padding:5px; background:#f0f0f0;">';
                html += '<input id="contact_name_'+i+'_'+j+'" value="'+(c.name||'')+'" placeholder="ФИО">';
                html += '<input id="contact_pos_'+i+'_'+j+'" value="'+(c.position||'')+'" placeholder="Должность">';
                html += '<input id="contact_phone_'+i+'_'+j+'" value="'+(c.phone||'')+'" placeholder="Телефон">';
                html += '<input id="contact_email_'+i+'_'+j+'" value="'+(c.email||'')+'" placeholder="Email">';
                html += '<button onclick="deleteContact('+i+','+j+')">×</button></div>';
            }
        }
        html += '<button onclick="addContact('+i+')">+ Добавить контакт</button>';
        html += '</div>';
    }
    html += '<button onclick="addDept()">+ Добавить отдел</button>';
    document.getElementById('departmentsEditor').innerHTML = html;
}

function addDept() {
    departments.push({name:'Новый отдел',contacts:[]});
    renderEditor();
}

function addContact(i) {
    if(!departments[i].contacts) departments[i].contacts=[];
    departments[i].contacts.push({name:'',position:'',phone:'',email:''});
    renderEditor();
}

function deleteContact(i,j) {
    departments[i].contacts.splice(j,1);
    renderEditor();
}

function deleteDept(i) {
    departments.splice(i,1);
    renderEditor();
}

function moveUp(i) {
    if(i>0) {
        let d=departments[i];
        departments[i]=departments[i-1];
        departments[i-1]=d;
        renderEditor();
    }
}

function moveDown(i) {
    if(i<departments.length-1) {
        let d=departments[i];
        departments[i]=departments[i+1];
        departments[i+1]=d;
        renderEditor();
    }
}

document.getElementById('saveToGithubBtn').onclick = async function() {
    // Собираем данные из полей ввода
    for(let i=0; i<departments.length; i++) {
        let deptInput = document.getElementById('dept_name_'+i);
        if(deptInput) departments[i].name = deptInput.value;
        
        if(departments[i].contacts) {
            for(let j=0; j<departments[i].contacts.length; j++) {
                let name = document.getElementById('contact_name_'+i+'_'+j);
                let pos = document.getElementById('contact_pos_'+i+'_'+j);
                let phone = document.getElementById('contact_phone_'+i+'_'+j);
                let email = document.getElementById('contact_email_'+i+'_'+j);
                if(name) departments[i].contacts[j].name = name.value;
                if(pos) departments[i].contacts[j].position = pos.value;
                if(phone) departments[i].contacts[j].phone = phone.value;
                if(email) departments[i].contacts[j].email = email.value;
            }
        }
    }
    
    document.getElementById('saveStatus').innerText = 'Сохранение...';
    
    try {
        let data = {departments: departments};
        let json = JSON.stringify(data, null, 2);
        // Самый простой способ - вообще без кодирования
        let content = btoa(unescape(encodeURIComponent(json)));
        
        let body = {
            message: 'update',
            content: content
        };
        if(fileSha) body.sha = fileSha;
        
        let res = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + githubToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if(res.ok) {
            document.getElementById('saveStatus').innerText = '✅ Сохранено!';
            let d = await res.json();
            fileSha = d.content.sha;
        } else {
            document.getElementById('saveStatus').innerText = '❌ Ошибка';
        }
    } catch(e) {
        document.getElementById('saveStatus').innerText = '❌ Ошибка';
    }
};
