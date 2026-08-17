const API = '/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = '/login/';

// Avatar
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('avatar-initial').textContent = username[0].toUpperCase();
    document.getElementById('avatar-username').textContent = username;
}

// Logout
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login/';
});

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

// Calendar state
let currentDate = new Date();
let allTasks = [];

// Fetch all tasks
async function fetchTasks() {
    const res = await fetch(`${API}/lists/`, {
        headers: { 'Authorization': `Token ${token}` }
    });
    const lists = await res.json();
    allTasks = [];
    lists.forEach(list => {
        list.tasks.forEach(task => {
            if (task.due_date) {
                allTasks.push({
                    ...task,
                    listName: list.name
                });
            }
        });
    });
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('month-title').textContent = new Date(year, month).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const grid = document.getElementById('cal-grid');
    grid.innerHTML= '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-cell empty';
        grid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayTasks = allTasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));

        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        if (dateStr === today) cell.classList.add('today');
        if (dayTasks.length > 0) cell.classList.add('has-tasks');

        cell.innerHTML = `
            <span class="cal-day-num">${d}</span>
            ${dayTasks.slice(0, 2).map(t => `
                <div class="cal-task-chip priority-chip-${t.priority || 'medium'}${t.completed ? ' completed' : ''}">
                ${t.title}
                </div>
            `).join('')}
            ${dayTasks.length > 2 ? `<div class="cal-more">+${dayTasks.length - 2}more</div>` : ''}
        `;
        cell.addEventListener('click', () => showDayTasks(dateStr, dayTasks));
        grid.appendChild(cell);
    }

    // Hide task panel when month changes
    document.getElementById('cal-task-panel').classList.add('d-none');
}

// Show tasks for a day
function showDayTasks(dateStr, tasks) {
    const panel = document.getElementById('cal-task-panel');
    const panelDate = document.getElementById('cal-task-panel-date');
    const taskList = document.getElementById('cal-task-list');

    const formatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    panelDate.textContent = formatted;

    if (tasks.length > 0) {
        taskList.innerHTML = tasks.map(t => `
            <li class="cal-task-item ${t.completed ? 'completed' : ''}">
                <span class="priority-dot priority-${t.priority || 'medium'}"></span>
                <span class="cal-task-title">${t.title}</span>
                <span class="cal-task-list-name">${t.listName}</span>
                ${t.completed ? '<i class="bi bi-check-circle-fill text-success ms-auto"></i>' : ''}
            </li>
        `).join('');
    }
    panel.classList.remove('d-none');
}


// Month navigation
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});


// Service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/service-worker.js')
    });
}

fetchTasks();
