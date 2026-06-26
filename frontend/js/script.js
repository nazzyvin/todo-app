// console.log('SCRIPT LOADED', new Date().toLocaleTimeString());

// window.addEventListener('beforeunload', function () {
//     console.log('PAGE IS RELOADING');
// });


const API = 'http://127.0.0.1:8000/api';

// Redirect to login if no token
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// Helper function for API calls
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
            ...options.headers,
        }
    });
    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
    return res;
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('toast-message');

    toastMsg.textContent = message;
    toast.className = `toast align-items-center border-0 text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'}`;

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


document.addEventListener('DOMContentLoaded', function () {

    /* =========================
        AVATAR INITIAL
    =========================*/
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('avatar-initial').textContent = username[0].toUpperCase();
        document.getElementById('avatar-username').textContent = username;
    }

    /* =========================
        THEME TOGGLE
    =========================*/
    const themeIcon = document.getElementById('theme-icon');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.className = 'bi bi-moon-fill';
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'bi bi-sun-fill';
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            themeIcon.className = 'bi bi-circle-half';
        }
        localStorage.setItem('theme', theme);

        // Update active state in dropdown
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-theme-value') === theme);
        });
    }

    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', function(e) {
            e.preventDefault();
            applyTheme(this.getAttribute('data-theme-value'));
        });
    });

    // Apply saved theme on load
    applyTheme(localStorage.getItem('theme') || 'system');

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
        if (localStorage.getItem('theme') === 'system') {
            applyTheme('system');
        }
    });

    /* =========================
        SEARCH LISTS
    =========================*/
    const searchControl = document.getElementById('search-control');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    let activeFilter = 'all';
    let searchTerm = '';

    function applyListFilters() {
        document.querySelectorAll('#lists-container .col[data-list-id]').forEach(col => {
            const category = col.getAttribute('data-category') || '';
            const categoryMatches = activeFilter === 'all' || category === activeFilter;

            const searchableText = col.textContent.toLowerCase();
            const searchMatches = !searchTerm || searchableText.includes(searchTerm);

            col.style.display = categoryMatches && searchMatches ? '' : 'none';
        });
    }

    searchBtn.addEventListener('click', function () {
        searchControl.classList.add('open');
        searchInput.focus();
    });

    searchInput.addEventListener('input', function () {
        searchTerm = this.value.trim().toLowerCase();
        applyListFilters();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchTerm = '';
            searchControl.classList.remove('open');
            applyListFilters();
        }
        if (e.key === 'Enter') {
            searchControl.classList.remove('open');
        }
    });

    document.addEventListener('click', function (e) {
        if (!searchControl.contains(e.target)) {
            searchControl.classList.remove('open');
        }
    });


    /* =========================
        PROGRESS CALCULATION
    ========================== */

    function updateProgress(card) {
        if (!card) return;

        const tasks = card.querySelectorAll('.task-row');
        const totalTasks = tasks.length;
        let completedTasks = 0;

        tasks.forEach(task => {
            const checkbox = task.querySelector('.form-check-input');
            const label = task.querySelector('.form-check-label');

            if (!checkbox) return;

            if (checkbox.checked) {
                completedTasks++;
                task.classList.add('completed');

                if (label) {
                    label.classList.add('text-decoration-line-through');
                }
            } else {
                task.classList.remove('completed');

                if (label) {
                    label.classList.remove('text-decoration-line-through');
                }
            }
        });

        const percentage =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Update meta text
        const meta = card.querySelector('.card-meta');
        if (meta) {
            meta.textContent = `${completedTasks} of ${totalTasks} tasks`;
        }

        // Update progress bar
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute(`aria-valuenow`, percentage);
        }
    }


    /* =========================
        TASKS PREVIEW (3 + MORE)
    =========================*/

    function setupTaskPreview(card) {
        const taskList = card.querySelector('.task-list');
        if (!taskList) return;

        const tasks = Array.from(taskList.querySelectorAll('.task-row'));
        const MAX_VISIBLE = 3;

        // Remove existing "+ more" button
        const existingBtn = taskList.querySelector('.more-tasks-btn');
        if (existingBtn) existingBtn.remove();

        // Always reset task visibility first
        tasks.forEach(task => {
            task.classList.remove('task-hidden');
        });

        // If 3 or fewer → show all, no button
        if (tasks.length <= MAX_VISIBLE) return;

        // Hide tasks after the 3rd
        tasks.forEach((task, index) => {
            if (index >= MAX_VISIBLE) {
                task.classList.add('task-hidden');
            }
        });

        const hiddenCount = tasks.length - MAX_VISIBLE;
        let expanded = false;

        const moreBtn = document.createElement('div');
        moreBtn.className = 'text-muted small mt-1 more-tasks-btn';
        moreBtn.style.cursor = 'pointer';
        moreBtn.textContent = `+${hiddenCount} more tasks…`;

        moreBtn.addEventListener('click', () => {
            expanded = !expanded;

            tasks.forEach((task, index) => {
                if (index >= MAX_VISIBLE) {
                    task.classList.toggle('task-hidden', !expanded);
                }
            });

            moreBtn.textContent = expanded
                ? 'Show less'
                : `+${hiddenCount} more tasks…`;
        });

        taskList.appendChild(moreBtn);
    }


    /* =========================
        ADD TASK TO CARD
    =========================*/

    function addTaskToCard(card, taskText, taskId = null, dueDate = null) {
        const taskList = card.querySelector('.task-list');
        if (!taskList || !taskText.trim()) return;

        // Create task row
        const taskRow = document.createElement('div');
        taskRow.className = 'task-row';
        if (taskId) taskRow.setAttribute('data-task-id', taskId);

        taskRow.innerHTML = `
        <span class="task-handle">
            <i class="bi bi-grip-vertical"></i>
        </span>
        <input class="form-check-input" type="checkbox">
        <label class="form-check-label">${taskText}</label>
        <div class="task-actions dropdown">
            <button type="button" class="btn-task-menu" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <a class="dropdown-item btn-edit-task" href="#">
                        <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                </li>
                <li>
                    <a class="dropdown-item text-danger btn-delete-task" href="#">
                        <i class="bi bi-trash me-2"></i>Delete
                    </a>
                </li>
            </ul>
        </div>
        `;
        taskList.appendChild(taskRow);
        taskRow.setAttribute('draggable', 'true');

        // Re-run logic
        updateProgress(card);
        setupTaskPreview(card);
    }


    /* =========================
        INITIALIZE ALL CARDS
    =========================*/

    const cards = document.querySelectorAll('.list-card');
    cards.forEach(card => {
        updateProgress(card);
        setupTaskPreview(card);
    });


    /* =========================
        CHECKBOX TOGGLES
        (Event Delegation)
    ========================= */

    document.addEventListener('change', function (e) {
        if (!e.target.classList.contains('form-check-input')) return;

        const taskRow = e.target.closest('.task-row');
        const card = e.target.closest('.list-card');
        if (!taskRow || !card) return;

        const taskId = taskRow.getAttribute('data-task-id');

        updateProgress(card);

        if (taskId) {
            apiFetch(`/tasks/${taskId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ completed: e.target.checked })
            });
        }
    });

    /* =========================
        ADD TASK TOGGLE + SUBMIT
    ========================= */

    document.addEventListener('click', function (e) {

        // OPEN add-task input
        if (e.target.classList.contains('add-task-toggle')) {
            e.preventDefault();

            const card = e.target.closest('.list-card');
            if (!card) return;

            const form = card.querySelector('.add-task-row');
            const input = card.querySelector('.task-input');

            e.target.classList.add('d-none');
            form.classList.remove('d-none');

            input.focus();
            return;
        }

        // SUBMIT task
        if (e.target.classList.contains('btn-add-task')) {
            e.preventDefault();

            const card = e.target.closest('.list-card');
            if (!card) return;

            const input = card.querySelector('.task-input');
            const dueInput = card.querySelector('.task-due-input');
            const taskText = input.value.trim();
            const listId = card.closest('.col').getAttribute('data-list-id');
            const dueDate = dueInput ? dueInput.value : null;

            if (!taskText) return;

            // Save to API
            apiFetch('/tasks/', {
                method: 'POST',
                body: JSON.stringify({
                    title: taskText,
                    task_list: listId,
                    due_date: dueDate || null
                })
            }).then(res => {
                if (res.ok) {
                    res.json().then(task => {
                        addTaskToCard(card, task.title, task.id, task.due_date);
                        showToast('Task added!');
                    });
                }
            });

            input.value = '';
            if (dueInput) dueInput.value = '';
            card.querySelector('.add-task-row').classList.add('d-none');
            card.querySelector('.add-task-toggle').classList.remove('d-none');
        }
    });


    /* =========================
        ENTER KEY FOR CREATE LIST
    =========================*/
    document.getElementById('new-list-name').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('create-list-btn').click();
        }
    });


    /* =========================
        ENTER KEY SUBMIT
    =========================*/
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;

        const input = e.target;
        if (!input.classList.contains('task-input')) return;

        e.preventDefault();

        const card = input.closest('.list-card');
        const dueInput = card.querySelector('.task-due-input');
        const taskText = input.value.trim();
        const listId = card.closest('.col').getAttribute('data-list-id');
        const dueDate = dueInput ? dueInput.value : null;

        if (!taskText) return;

        apiFetch('/tasks/', {
            method: 'POST',
            body: JSON.stringify({
                title: taskText,
                task_list: listId,
                due_date: dueDate || null
            })
        }).then(res => {
            if (res.ok) {
                res.json().then(task => {
                    addTaskToCard(card, task.title, task.id, task.due_date);
                    showToast('Task added!');
                });
            }
        });

        input.value = '';
        if (dueInput) dueInput.value = '';
        card.querySelector('.add-task-row').classList.add('d-none');
        card.querySelector('.add-task-toggle').classList.remove('d-none');
    });


    /* =========================
        DRAG TASK
    ========================= */
    let draggedTask = null;

    document.addEventListener('dragstart', e => {
        const handle = e.target.closest('.task-handle');
        if (!handle) {
            e.preventDefault();
            return;
        }

        draggedTask = handle.closest('.task-row');
        draggedTask.classList.add('dragging');
    });

    document.addEventListener('dragend', () => {
        if (draggedTask) {
            draggedTask.classList.remove('dragging');
            draggedTask = null;
        }
    });

    document.addEventListener('dragover', e => {
        const taskList = e.target.closest('.task-list');
        if (!taskList || !draggedTask) return;

        e.preventDefault();

        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedTask);
        } else {
            taskList.insertBefore(draggedTask, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [
            ...container.querySelectorAll('.task-row:not(.dragging)')
        ];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }



    /* =========================
        DELETE KEY
    =========================*/

    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains('btn-delete-task') && !e.target.closest('.btn-delete-task')) return;
        e.preventDefault();

        const taskRow = e.target.closest('.task-row');
        const card = taskRow.closest('.list-card');
        const taskId = taskRow.getAttribute('data-task-id');

        if (taskId) {
            apiFetch(`/tasks/${taskId}/`, { method: 'DELETE' });
        }

        taskRow.remove();
        showToast('Task deleted', 'error');
        updateProgress(card);
        setupTaskPreview(card);
    });


    /* =========================
        DELETE LIST
    =========================*/
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-delete-list');
        if (!btn) return;
        e.preventDefault();

        const listId = btn.getAttribute('data-list-id');
        const col = btn.closest('.col');
        const category = col.getAttribute('data-category'); // ✅ FIX

        if (confirm('Delete this list and all its tasks?')) {
            apiFetch(`/lists/${listId}/`, { method: 'DELETE' }).then(() => {
                col.remove();
                showToast('List deleted', 'error');

                // ✅ FIXED selector (backticks + correct variable)
                const remaining = document.querySelectorAll(
                    `#lists-container .col[data-category="${category}"]`
                );

                if (remaining.length === 0) {
                    const catLink = document.querySelector(
                        `#listTabs .dynamic-category a[data-filter="${category}"]`
                    );
                    if (catLink) catLink.closest('.nav-item').remove();
                }
            });
        }
    });



    /* =========================
        LOGOUT
    =======================*/
    document.getElementById('logout-btn').addEventListener('click', function (e) {
        e.preventDefault();

        localStorage.removeItem('token');
        localStorage.removeItem('username');

        window.location.href = 'login.html';
    });



    /* =========================
        ALL FILTER (SIDEBAR)
    ========================= */
    const allFilter = document.querySelector('[data-filter="all"]');

    allFilter.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('#listTabs .nav-link')
            .forEach(l => l.classList.remove('active'));

        this.classList.add('active');

        activeFilter = 'all';
        applyListFilters();
    });


    /* =========================
    LOAD LISTS FROM API
    =========================*/
    async function loadLists() {
        const res = await apiFetch('/lists/');
        const lists = await res.json();
        const container = document.getElementById('lists-container');

        // Update sidebar categories only if they changed
        const listTabs = document.getElementById('listTabs');
        const categories = [...new Set(lists.map(l => l.category).filter(c => c))];

        const existingCategories = new Set(
            [...listTabs.querySelectorAll('.dynamic-category a')].map(a => a.getAttribute('data-filter'))
        );

        const categoriesChanged =
            categories.length !== existingCategories.size ||
            categories.some(c => !existingCategories.has(c));

        if (categoriesChanged) {
            listTabs.querySelectorAll('.dynamic-category').forEach(el => el.remove());

            categories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'nav-item dynamic-category';
                li.innerHTML = `
                    <a href="#" class="nav-link d-flex align-items-center" data-filter="${category}">
                        <i class="bi bi-folder me-2 fs-5"></i> ${category}
                    </a>
                `;
                listTabs.appendChild(li);

                li.querySelector('a').addEventListener('click', function (e) {
                    e.preventDefault();

                    document.querySelectorAll('#listTabs .nav-link')
                        .forEach(l => l.classList.remove('active'));

                    this.classList.add('active');
                    activeFilter = this.getAttribute('data-filter');
                    applyListFilters();

                });
            });
        }

        // Get existing lis IDs in the DOM
        const existingIds = new Set(
            [...container.querySelectorAll('.col[data-list-id]')].map(el => el.getAttribute('data-list-id'))
        );

        // Get new list IDs from API
        const newIds = new Set(lists.map(l => String(l.id)));

        // Remove cards that no longer exist
        container.querySelectorAll('.col[data-list-id]').forEach(col => {
            if (!newIds.has(col.getAttribute('data-list-id'))) {
                col.remove();
            }
        });

        // Add new cards without touching existing ones
        lists.forEach(list => {
            if (!existingIds.has(String(list.id))) {
                const col = document.createElement('div');
                col.className = 'col h-100';
                col.setAttribute('data-category', list.category);
                col.setAttribute('data-list-id', list.id);
                col.innerHTML = buildCardHTML(list);
                container.appendChild(col);

                const card = col.querySelector('.list-card');
                updateProgress(card);
                setupTaskPreview(card);
            }
        });
        // Show empty state if no lists
        const emptyState = container.querySelector('.empty-state');
        if (lists.length === 0) {
            if (!emptyState) {
                container.innerHTML = `
                        <div class="empty-state text-center py-5 w-100">
                            <i class="bi bi-clipboard2 fs-1 text-muted"></i>
                            <h5 class="mt-3 text-muted">No lists yet</h5>
                            <p class="text-muted small">Click "Create New List" to get started</p>
                        </div>
                    `;
            }
        } else {
            if (emptyState) emptyState.remove();
        }
    }

    // Build card HTML from list data
    function buildCardHTML(list) {
        const tasksHTML = list.tasks.map(task => `
                <div class="task-row" data-task-id="${task.id} draggable="true">
                    <span class="task-handle">
                        <i class="bi bi-grip-vertical"></i>
                    </span>
                    <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''}>
                    <label class="form-check-label ${task.completed ? 'text-muted text-decoration-line-through' : ''}">
                        ${task.title}
                    </label>
                    ${task.due_date ? `<span class="task-due-date"><i class="bi bi-calendar3 me-1"></i>${formatDate(task.due_date)}</span>` : ''}
                    <div class="task-actions dropdown">
                        <button type="button" class="btn-task-menu" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item btn-edit-task" href="#">
                                    <i class="bi bi-pencil me-2"></i>Edit
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item text-danger btn-delete-task" href="#">
                                    <i class="bi bi-trash me-2"></i>Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
        `).join('');

        return `
            <div class="card list-card">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <span class="list-name">${list.name}</span>
                    <div class="dropdown">
                        <button type="button" class="btn btn-sm btn-light dropdown-toggle-dots" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item btn-rename-list" href="#" data-list-id="${list.id}">
                                    <i class="bi bi-pencil me-2"></i>Rename
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item text-danger btn-delete-list" href="#" data-list-id="${list.id}">
                                    <i class="bi bi-trash me-2"></i>Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="text-muted card-meta small">0 of ${list.tasks.length} tasks</div>
                <div class="progress" style="height: 7.9px;">
                    <div class="progress-bar" style="width: 0%;"></div>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="task-list">${tasksHTML}</div>
                    <button type="button" class="btn btn-link btn-sm px-0 text-primary show-more-btn d-none"></button>
                    <button type="button" class="add-task-toggle">+ Add a task</button>
                    <div class="add-task-row d-none">
                        <input type="text" class="form-control form-control-sm task-input" placeholder="Enter task name...">
                        <input type="date" class="form-control form-control-sm task-due-input">
                        <button type="button" class="btn btn-add-task btn-sm">Add</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Call loadLists on page load
    loadLists();


    /* =========================
        CREATE NEW LIST
    =========================*/
    document.getElementById('create-list-btn').addEventListener('click', async function (e) {
        e.preventDefault();

        const name = document.getElementById('new-list-name').value.trim();
        const category = document.getElementById('new-list-category').value.trim();

        if (!name) return;

        const res = await apiFetch('/lists/', {
            method: 'POST',
            body: JSON.stringify({ name, category })
        });

        if (res.ok) {
            const list = await res.json();
            document.getElementById('new-list-name').value = '';
            document.getElementById('new-list-category').value = '';
            bootstrap.Modal.getInstance(document.getElementById('createListModal')).hide();
            showToast('List created successfully!');

            // Add card directly without reloading
            const container = document.getElementById('lists-container');
            const col = document.createElement('div');
            col.className = 'col h-100';
            col.setAttribute('data-category', list.category);
            col.setAttribute('data-list-id', list.id);
            col.innerHTML = buildCardHTML(list);
            container.appendChild(col);

            const card = col.querySelector('.list-card');
            updateProgress(card);
            setupTaskPreview(card);

            // Add category to sidebar only if it doesn't exist
            const listTabs = document.getElementById('listTabs');
            const exists = listTabs.querySelector(`.dynamic-category a[data-filter="${list.category}"]`);
            if (!exists && list.category) {
                const li = document.createElement('li');
                li.className = 'nav-item dynamic-category';
                li.innerHTML = `
                    <a href="#" class="nav-link d-flex align-items-center" data-filter="${list.category}">
                        <i class="bi bi-folder me-2 fs-5"></i> ${list.category}
                    </a>
                `;
                listTabs.appendChild(li);

                li.querySelector('a').addEventListener('click', function (e) {
                    e.preventDefault();

                    document.querySelectorAll('#listTabs .nav-link')
                        .forEach(l => l.classList.remove('active'));

                    this.classList.add('active');

                    activeFilter = this.getAttribute('data-filter');
                    applyListFilters();
                });

            }
        }
    });


    /* =========================
        CLICK OUTSIDE TO CLOSE
    =========================*/
    document.addEventListener('click', function (e) {
        if (
            !e.target.classList.contains('add-task-toggle') &&
            !e.target.classList.contains('task-input') &&
            !e.target.classList.contains('btn-add-task') &&
            !e.target.classList.contains('task-due-input') &&
            !e.target.closest('.add-task-row')
        ) {
            document.querySelectorAll('.add-task-row').forEach(form => {
                form.classList.add('d-none');
            });
            document.querySelectorAll('.add-task-toggle').forEach(btn => {
                btn.classList.remove('d-none');
            });
        }
    });

    /* =========================
        RENAME LIST
    =========================*/
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-rename-list');
        if (!btn) return;
        e.preventDefault();

        const listId = btn.getAttribute('data-list-id');
        const col = document.querySelector(`.col[data-list-id="${listId}"]`);
        const nameEl = col.querySelector('.list-name');
        const currentName = nameEl.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'form-control form-control-sm list-rename-input';

        nameEl.replaceWith(input);
        input.focus();
        input.select();

        async function saveRename() {
            const newName = input.value.trim();
            if (!newName || newName === currentName) {
                input.replaceWith(nameEl);
                return;
            }

            const res = await apiFetch(`/lists/${listId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                nameEl.textContent = newName;
                input.replaceWith(nameEl);
                showToast('List renamed!');
            } else {
                input.replaceWith(nameEl);
                showToast('Failed to rename list', 'error');
            }
        }

            input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); saveRename(); }
            if (e.key === 'Escape') { input.replaceWith(nameEl); }
        });
    });


    /* =========================
        EDIT TASK
    =========================*/
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-edit-task');
        if (!btn) return;
        e.preventDefault();
    
        const taskRow = btn.closest('.task-row');
        const taskId = taskRow.getAttribute('data-task-id');
        const label = taskRow.querySelector('.form-check-label');
        const currentText = label.textContent.trim();
    
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'form-control form-control-sm task-edit-input';
    
        label.replaceWith(input);
        input.focus();
        input.select();
    
        async function saveEdit() {
            const newText = input.value.trim();
            if (!newText || newText === currentText) {
                input.replaceWith(label);
                return;
            }
    
            const res = await apiFetch(`/tasks/${taskId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ title: newText })
            });
    
            if (res.ok) {
                label.textContent = newText;
                input.replaceWith(label);
                showToast('Task updated!');
            } else {
                input.replaceWith(label);
                showToast('Failed to update task', 'error');
            }
        }
    
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
            if (e.key === 'Escape') { input.replaceWith(label); }
        });
    });
    
    
    /* =========================
    MOBILE SIDEBAR TOGGLE
    ========================*/
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
});

