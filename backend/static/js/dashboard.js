const API = '/api';

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login/'
}

// Set avatar
const username = localStorage.getItem('username')
if (username) {
    document.getElementById('avatar-initial').textContent = username[0].toUpperCase()
    document.getElementById('avatar-username').textContent = username
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/login/'
})

// Mobile sidebar
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sidebar-overlay');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

// Load dashboard data
async function loadDashboard() {
    const res = await fetch(`${API}/lists/`, {
        headers: { 'Authorization': `Token ${token}` }
    });
    const lists = await res.json();

    let totalTasks = 0;
    let completedTasks = 0;
    const today = new Date().toISOString().split('T')[0];
    const dueTodayItems = [];

    lists.forEach(list=> {
        list.tasks.forEach(task=> {
            totalTasks++;
            if (task.completed) completedTasks++;
            if (task.due_date && task.due_date.startsWith(today) && !task.completed) {
                dueTodayItems.push({ title: task.title, list: list.name });
            }
        });
    });

    const pendingTasks = totalTasks - completedTasks;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update stat cards
    document.getElementById('total-lists').textContent = lists.length;
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;

    // Update progress ring
    document.getElementById('progress-percent').textContent = `${percentage}%`;
    const circumference = 314;
    const offset = circumference - (percentage / 100) * circumference;
    document.getElementById('progress-ring-fill').style.strokeDashoffset = offset;

    // Due today
    const dueTodayList = document.getElementById(`due-today-list`);
    if (dueTodayItems.length === 0) {
        dueTodayList.innerHTML = '<li class="due-today-empty">No tasks due today 🎉</li>';
    } else {
        dueTodayList.innerHTML = dueTodayItems.map(item => `
            <li class="due-today-item">
            <i class="bi bi-calendar3 text-primary"></i>
            <span>${item.title}</span>
            <small class="text-muted ms-auto">${item.list}</small>
            </li>
        `).join('');
    }

    // List overview
    const listsOverview = document.getElementById('lists-overview');
    listsOverview.innerHTML = lists.map(list => {
        const total = list.tasks.length;
        const done = list.tasks.filter(t => t.completed).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return `
            <div class="list-overview-item">
                <span class="list-overview-name">${list.name}</span>
                <div class="list-overview-bar">
                    <div class="list-overview-bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="list-overview-count">${done}/${total}</span>
            </div>
        `;
    }).join('');
}

loadDashboard();