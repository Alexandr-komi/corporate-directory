let data = {departments: []};
let token = '';
let sha = '';

function login() {
    token = document.getElementById('token').value;
    if(!token) return;
    load();
}

async function load() {
    let r = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
        headers: {'Authorization': 'token '+token}
    });
    if(r.status == 404) { render(); return; }
    let d = await r.json();
    sha = d.sha;
    let content = decodeURIComponent(escape(atob(d.content)));
    data = JSON.parse(content);
    render();
}

function render() {
    let html = '';
    for(let i=0; i<data.departments.length; i++) {
        let d = data.departments[i];
        html += `<div class="dept">`;
        html += `<input id="dept_${i}" value="${(d.name||'').replace(/"/g, '&quot;')}" placeholder="Название отдела">`;
        html += `<button onclick="moveUp(${i})">↑</button>`;
        html += `<button onclick="moveDown(${i})">↓</button>`;
        html += `<button onclick="delDept(${i})">Удалить</button>`;
        if(d.contacts) for(let j=0; j<d.contacts.length; j++) {
            let c = d.contacts[j];
            html += `<div class="contact">`;
            html += `<input id="name_${i}_${j}" value="${(c.name||'').replace(/"/g, '&quot;')}" placeholder="ФИО">`;
            html += `<input id="pos_${i}_${j}" value="${(c.position||'').replace(/"/g, '&quot;')}" placeholder="Должность">`;
            html += `<input id="phone_${i}_${j}" value="${(c.phone||'').replace(/"/g, '&quot;')}" placeholder="Телефон">`;
            html += `<input id="email_${i}_${j}" value="${(c.email||'').replace(/"/g, '&quot;')}" placeholder="Email">`;
            html += `<button onclick="delContact(${i},${j})">×</button>`;
            html += `</div>`;
        }
        html += `<button onclick="addContact(${i})">+ Контакт</button>`;
        html += `</div>`;
    }
    document.getElementById('editor').innerHTML = html;
}

function addDept() {
    data.departments.push({name:'Новый отдел',contacts:[]});
    render();
}

function addContact(i) {
    if(!data.departments[i].contacts) data.departments[i].contacts=[];
    data.departments[i].contacts.push({name:'',position:'',phone:'',email:''});
    render();
}

function delContact(i,j) {
    data.departments[i].contacts.splice(j,1);
    render();
}

function delDept(i) {
    data.departments.splice(i,1);
    render();
}

function moveUp(i) {
    if(i>0) {
        let t = data.departments[i];
        data.departments[i] = data.departments[i-1];
        data.departments[i-1] = t;
        render();
    }
}

function moveDown(i) {
    if(i<data.departments.length-1) {
        let t = data.departments[i];
        data.departments[i] = data.departments[i+1];
        data.departments[i+1] = t;
        render();
    }
}

async function save() {
    for(let i=0; i<data.departments.length; i++) {
        let inp = document.getElementById(`dept_${i}`);
        if(inp) data.departments[i].name = inp.value;
        if(data.departments[i].contacts) {
            for(let j=0; j<data.departments[i].contacts.length; j++) {
                let n = document.getElementById(`name_${i}_${j}`);
                let p = document.getElementById(`pos_${i}_${j}`);
                let ph = document.getElementById(`phone_${i}_${j}`);
                let e = document.getElementById(`email_${i}_${j}`);
                if(n) data.departments[i].contacts[j].name = n.value;
                if(p) data.departments[i].contacts[j].position = p.value;
                if(ph) data.departments[i].contacts[j].phone = ph.value;
                if(e) data.departments[i].contacts[j].email = e.value;
            }
        }
    }
    document.getElementById('status').innerText = 'Сохранение...';
    let json = JSON.stringify(data, null, 2);
    let content = btoa(unescape(encodeURIComponent(json)));
    let body = {message: 'update', content: content};
    if(sha) body.sha = sha;
    let r = await fetch('https://api.github.com/repos/Alexandr-komi/corporate-directory/contents/data.json', {
        method: 'PUT',
        headers: {'Authorization': 'token '+token, 'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    if(r.ok) {
        document.getElementById('status').innerText = '✅ Сохранено!';
        let d = await r.json();
        sha = d.content.sha;
    } else {
        document.getElementById('status').innerText = '❌ Ошибка';
    }
}