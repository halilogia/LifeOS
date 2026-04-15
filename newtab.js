import { translations, applyI18n } from './i18n.js';
import { updateTime, setRandomQuote, getStartOfWeek } from './utils.js';
document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const recurringList = document.getElementById('recurring-list');
    const tasksSection = document.getElementById('tasks-section');
    const recurringSection = document.getElementById('recurring-section');
    const emptyState = document.getElementById('empty-state');
    const quoteElement = document.getElementById('quote');
    const repeatSelect = document.getElementById('repeat-select');
    const backupButton = document.getElementById('backup-btn');
    const restoreButton = document.getElementById('restore-btn');
    const restoreInput = document.getElementById('restore-input');
    const navListBtn = document.getElementById('view-list-btn');
    const navKanbanBtn = document.getElementById('view-kanban-btn');
    const listView = document.getElementById('list-view');
    const kanbanView = document.getElementById('kanban-view');
    const kanbanTodo = document.querySelector('#col-todo .kanban-list');
    const kanbanInProgress = document.querySelector('#col-in-progress .kanban-list');
    const kanbanDone = document.querySelector('#col-done .kanban-list');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsClose = document.getElementById('settings-close');
    const clearAllBtn = document.getElementById('clear-all-btn');
    let currentLang = 'tr';
    function loadTodos() {
        chrome.storage.local.get(['todos'], (result) => {
            let todos = result.todos || [];
            let needsSave = false;
            todos = todos.map(todo => {
                if (!todo.status) {
                    todo.status = todo.completed ? 'done' : 'todo';
                    needsSave = true;
                }
                return todo;
            });
            const wasModified = checkAndResetRepeatingTasks(todos);
            if (wasModified || needsSave) {
                chrome.storage.local.set({ todos });
            }
            [todoList, recurringList, kanbanTodo, kanbanInProgress, kanbanDone].forEach(el => { if (el) {
                el.innerHTML = '';
            } });
            let oneCount = 0;
            let recCount = 0;
            todos.forEach((todo, index) => {
                if (todo.repeat === 'none') {
                    renderTodo(todo, index, todoList);
                    oneCount++;
                }
                else {
                    renderTodo(todo, index, recurringList);
                    recCount++;
                }
                renderKanbanItem(todo, index);
            });
            tasksSection.style.display = oneCount > 0 ? 'block' : 'none';
            recurringSection.style.display = recCount > 0 ? 'block' : 'none';
            emptyState.classList.toggle('active', (oneCount === 0 && recCount === 0));
        });
    }
    function checkAndResetRepeatingTasks(todos) {
        const now = new Date();
        const nowStr = now.toDateString();
        let modified = false;
        todos.forEach(todo => {
            if (todo.repeat && todo.repeat !== 'none' && todo.completed && todo.lastCompletedDate) {
                const lastDate = new Date(todo.lastCompletedDate);
                let shouldReset = false;
                if (todo.repeat === 'daily' && nowStr !== lastDate.toDateString()) {
                    shouldReset = true;
                }
                else if (todo.repeat === 'weekly') {
                    if (getStartOfWeek(now).getTime() > getStartOfWeek(lastDate).getTime()) {
                        shouldReset = true;
                    }
                }
                else if (todo.repeat === 'monthly') {
                    if (now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear()) {
                        shouldReset = true;
                    }
                }
                if (shouldReset) {
                    todo.completed = false;
                    todo.status = 'todo';
                    modified = true;
                }
            }
        });
        return modified;
    }
    function renderTodo(todo, index, targetList) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        const key = `repeat_${todo.repeat}`;
        const rLabel = todo.repeat !== 'none' ? `<span class="repeat-badge">${translations[currentLang][key]}</span>` : '';
        li.innerHTML = `
            <div class="checkbox">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="todo-text">${todo.text}</span>
            ${rLabel}
            <button class="delete-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        li.querySelector('.checkbox')?.addEventListener('click', () => toggleTodo(index));
        li.querySelector('.todo-text')?.addEventListener('click', () => toggleTodo(index));
        li.querySelector('.delete-btn')?.addEventListener('click', () => deleteTodo(index, li));
        targetList.appendChild(li);
    }
    function renderKanbanItem(todo, index) {
        const item = document.createElement('div');
        item.className = 'kanban-item';
        item.setAttribute('draggable', 'true');
        item.innerHTML = `
            <div class="kanban-item-text">${todo.text}</div>
            <div class="kanban-controls">
                <button class="move-btn move-left" title="${currentLang === 'tr' ? 'Sola Taşı' : 'Move Left'}" ${todo.status === 'todo' ? 'disabled' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="move-btn move-right" title="${currentLang === 'tr' ? 'Sağa Taşı' : 'Move Right'}" ${todo.status === 'done' ? 'disabled' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        `;
        item.addEventListener('dragstart', (e) => { e.dataTransfer?.setData('text/plain', index.toString()); item.classList.add('dragging'); });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.querySelector('.move-left')?.addEventListener('click', () => moveTask(index, -1));
        item.querySelector('.move-right')?.addEventListener('click', () => moveTask(index, 1));
        if (todo.status === 'todo') {
            kanbanTodo.appendChild(item);
        }
        else if (todo.status === 'in-progress') {
            kanbanInProgress.appendChild(item);
        }
        else if (todo.status === 'done') {
            kanbanDone.appendChild(item);
        }
    }
    function moveTaskWithStatus(index, newStatus) {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            if (index < 0 || index >= todos.length || todos[index].status === newStatus) {
                return;
            }
            todos[index].status = newStatus;
            todos[index].completed = newStatus === 'done';
            if (todos[index].completed) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }
    function moveTask(index, direction) {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            if (index < 0 || index >= todos.length) {
                return;
            }
            const statuses = ['todo', 'in-progress', 'done'];
            const nextIdx = statuses.indexOf(todos[index].status) + direction;
            if (nextIdx >= 0 && nextIdx < statuses.length) {
                moveTaskWithStatus(index, statuses[nextIdx]);
            }
        });
    }
    function deleteTodo(index, el) {
        el.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            chrome.storage.local.get(['todos'], (result) => {
                const todos = result.todos || [];
                if (index >= 0 && index < todos.length) {
                    todos.splice(index, 1);
                    chrome.storage.local.set({ todos }, loadTodos);
                }
            });
        }, 300);
    }
    function toggleTodo(index) {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            if (index < 0 || index >= todos.length) {
                return;
            }
            const isComp = !todos[index].completed;
            todos[index].completed = isComp;
            todos[index].status = isComp ? 'done' : 'todo';
            if (isComp) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }
    function switchView(view) {
        const isList = view === 'list';
        navListBtn.classList.toggle('active', isList);
        navKanbanBtn.classList.toggle('active', !isList);
        listView.classList.toggle('active', isList);
        kanbanView.classList.toggle('active', !isList);
    }
    function restoreData(e) {
        const input = e.target;
        if (!input.files || input.files.length === 0) {
            return;
        }
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                const t = JSON.parse(ev.target?.result);
                if (Array.isArray(t)) {
                    chrome.storage.local.set({ todos: t }, () => { loadTodos(); alert(translations[currentLang].alert_restore_success); });
                }
                else {
                    alert(translations[currentLang].alert_restore_invalid);
                }
            }
            catch {
                alert(translations[currentLang].alert_restore_error);
            }
            input.value = '';
        };
        r.readAsText(input.files[0]);
    }
    addButton.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (!text) {
            return;
        }
        chrome.storage.local.get(['todos'], (r) => {
            const t = r.todos || [];
            t.push({ text, completed: false, status: 'todo', repeat: repeatSelect.value, lastCompletedDate: null });
            chrome.storage.local.set({ todos: t }, () => { todoInput.value = ''; repeatSelect.value = 'none'; loadTodos(); });
        });
    });
    todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') {
        addButton.click();
    } });
    backupButton.addEventListener('click', () => {
        chrome.storage.local.get(['todos'], (r) => {
            const blob = new Blob([JSON.stringify(r.todos || [], null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
        });
    });
    restoreInput.addEventListener('change', restoreData);
    restoreButton.addEventListener('click', () => restoreInput.click());
    navListBtn.addEventListener('click', () => switchView('list'));
    navKanbanBtn.addEventListener('click', () => switchView('kanban'));
    langToggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        chrome.storage.local.set({ lang: currentLang }, () => { applyI18n(currentLang, todoInput, langToggleBtn); setRandomQuote(quoteElement, currentLang); updateTime(clockElement, dateElement, currentLang); loadTodos(); });
    });
    settingsBtn.addEventListener('click', () => settingsPanel.classList.add('active'));
    settingsClose.addEventListener('click', () => settingsPanel.classList.remove('active'));
    clearAllBtn.addEventListener('click', () => { if (confirm(translations[currentLang].alert_clear_confirm)) {
        chrome.storage.local.clear(() => { chrome.storage.local.set({ lang: currentLang }, () => { loadTodos(); settingsPanel.classList.remove('active'); }); });
    } });
    settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) {
        settingsPanel.classList.remove('active');
    } });
    [kanbanTodo, kanbanInProgress, kanbanDone].forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.closest('.kanban-column')?.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.closest('.kanban-column')?.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.closest('.kanban-column')?.classList.remove('drag-over');
            const idx = e.dataTransfer?.getData('text/plain');
            if (idx !== undefined) {
                moveTaskWithStatus(parseInt(idx), col.dataset.status);
            }
        });
    });
    chrome.storage.local.get(['lang'], (r) => {
        currentLang = r.lang || 'tr';
        applyI18n(currentLang, todoInput, langToggleBtn);
        setRandomQuote(quoteElement, currentLang);
        updateTime(clockElement, dateElement, currentLang);
        loadTodos();
    });
    setInterval(() => updateTime(clockElement, dateElement, currentLang), 1000);
});
