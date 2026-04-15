import { Todo, Language } from './types.js';
import { translations, applyI18n } from './i18n.js';
import { updateTime, setRandomQuote, getStartOfWeek } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock') as HTMLDivElement;
    const dateElement = document.getElementById('date') as HTMLDivElement;
    const todoInput = document.getElementById('todo-input') as HTMLInputElement;
    const addButton = document.getElementById('add-btn') as HTMLButtonElement;
    const todoList = document.getElementById('todo-list') as HTMLUListElement;
    const recurringList = document.getElementById('recurring-list') as HTMLUListElement;
    const tasksSection = document.getElementById('tasks-section') as HTMLDivElement;
    const recurringSection = document.getElementById('recurring-section') as HTMLDivElement;
    const emptyState = document.getElementById('empty-state') as HTMLDivElement;
    const quoteElement = document.getElementById('quote') as HTMLParagraphElement;
    const repeatSelect = document.getElementById('repeat-select') as HTMLSelectElement;
    const backupButton = document.getElementById('backup-btn') as HTMLButtonElement;
    const restoreButton = document.getElementById('restore-btn') as HTMLButtonElement;
    const restoreInput = document.getElementById('restore-input') as HTMLInputElement;

    const navListBtn = document.getElementById('view-list-btn') as HTMLButtonElement;
    const navKanbanBtn = document.getElementById('view-kanban-btn') as HTMLButtonElement;
    const listView = document.getElementById('list-view') as HTMLElement;
    const kanbanView = document.getElementById('kanban-view') as HTMLElement;
    const kanbanTodo = document.querySelector('#col-todo .kanban-list') as HTMLDivElement;
    const kanbanInProgress = document.querySelector('#col-in-progress .kanban-list') as HTMLDivElement;
    const kanbanDone = document.querySelector('#col-done .kanban-list') as HTMLDivElement;
    const langToggleBtn = document.getElementById('lang-toggle-btn') as HTMLButtonElement;
    const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
    const settingsPanel = document.getElementById('settings-panel') as HTMLDivElement;
    const settingsClose = document.getElementById('settings-close') as HTMLButtonElement;
    const clearAllBtn = document.getElementById('clear-all-btn') as HTMLButtonElement;

    let currentLang: Language = 'tr';

    function loadTodos(): void {
        chrome.storage.local.get(['todos'], (result) => {
            let todos: Todo[] = (result.todos as Todo[]) || [];
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

            [todoList, recurringList, kanbanTodo, kanbanInProgress, kanbanDone].forEach(el => { if (el) { el.innerHTML = ''; } });
            
            let oneCount = 0;
            let recCount = 0;

            todos.forEach((todo, index) => {
                if (todo.repeat === 'none') {
                    renderTodo(todo, index, todoList);
                    oneCount++;
                } else {
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

    function checkAndResetRepeatingTasks(todos: Todo[]): boolean {
        const now = new Date();
        const nowStr = now.toDateString();
        let modified = false;

        todos.forEach(todo => {
            if (todo.repeat && todo.repeat !== 'none' && todo.completed && todo.lastCompletedDate) {
                const lastDate = new Date(todo.lastCompletedDate);
                let shouldReset = false;

                if (todo.repeat === 'daily' && nowStr !== lastDate.toDateString()) {
                    shouldReset = true;
                } else if (todo.repeat === 'weekly') {
                    if (getStartOfWeek(now).getTime() > getStartOfWeek(lastDate).getTime()) {
                        shouldReset = true;
                    }
                } else if (todo.repeat === 'monthly') {
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

    function renderTodo(todo: Todo, index: number, targetList: HTMLUListElement): void {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        const key = `repeat_${todo.repeat}` as keyof typeof translations['tr'];
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

    function renderKanbanItem(todo: Todo, index: number): void {
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

        if (todo.status === 'todo') { kanbanTodo.appendChild(item); }
        else if (todo.status === 'in-progress') { kanbanInProgress.appendChild(item); }
        else if (todo.status === 'done') { kanbanDone.appendChild(item); }
    }

    function moveTaskWithStatus(index: number, newStatus: Todo['status']): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            if (index < 0 || index >= todos.length || todos[index].status === newStatus) { return; }
            todos[index].status = newStatus;
            todos[index].completed = newStatus === 'done';
            if (todos[index].completed) { todos[index].lastCompletedDate = new Date().toISOString(); }
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function moveTask(index: number, direction: number): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            if (index < 0 || index >= todos.length) { return; }
            const statuses: Todo['status'][] = ['todo', 'in-progress', 'done'];
            const nextIdx = statuses.indexOf(todos[index].status) + direction;
            if (nextIdx >= 0 && nextIdx < statuses.length) { moveTaskWithStatus(index, statuses[nextIdx]); }
        });
    }

    function deleteTodo(index: number, el: HTMLLIElement): void {
        el.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            chrome.storage.local.get(['todos'], (result) => {
                const todos: Todo[] = (result.todos as Todo[]) || [];
                if (index >= 0 && index < todos.length) { todos.splice(index, 1); chrome.storage.local.set({ todos }, loadTodos); }
            });
        }, 300);
    }

    function toggleTodo(index: number): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            if (index < 0 || index >= todos.length) { return; }
            const isComp = !todos[index].completed;
            todos[index].completed = isComp;
            todos[index].status = isComp ? 'done' : 'todo';
            if (isComp) { todos[index].lastCompletedDate = new Date().toISOString(); }
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function switchView(view: 'list' | 'kanban'): void {
        const isList = view === 'list';
        navListBtn.classList.toggle('active', isList);
        navKanbanBtn.classList.toggle('active', !isList);
        listView.classList.toggle('active', isList);
        kanbanView.classList.toggle('active', !isList);
    }

    function restoreData(e: Event): void {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) { return; }
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                const t = JSON.parse(ev.target?.result as string);
                if (Array.isArray(t)) { chrome.storage.local.set({ todos: t }, () => { loadTodos(); alert(translations[currentLang].alert_restore_success); }); }
                else { alert(translations[currentLang].alert_restore_invalid); }
            } catch { alert(translations[currentLang].alert_restore_error); }
            input.value = '';
        };
        r.readAsText(input.files[0]);
    }

    addButton.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (!text) { return; }
        chrome.storage.local.get(['todos'], (r) => {
            const t: Todo[] = (r.todos as Todo[]) || [];
            t.push({ text, completed: false, status: 'todo', repeat: repeatSelect.value as Todo['repeat'], lastCompletedDate: null });
            chrome.storage.local.set({ todos: t }, () => { todoInput.value = ''; repeatSelect.value = 'none'; loadTodos(); });
        });
    });

    todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { addButton.click(); } });
    backupButton.addEventListener('click', () => { chrome.storage.local.get(['todos'], (r) => {
        const blob = new Blob([JSON.stringify(r.todos || [], null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    }); });

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
    clearAllBtn.addEventListener('click', () => { if (confirm(translations[currentLang].alert_clear_confirm)) { chrome.storage.local.clear(() => { chrome.storage.local.set({ lang: currentLang }, () => { loadTodos(); settingsPanel.classList.remove('active'); }); }); } });
    settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) { settingsPanel.classList.remove('active'); } });

    [kanbanTodo, kanbanInProgress, kanbanDone].forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.closest('.kanban-column')?.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.closest('.kanban-column')?.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault(); col.closest('.kanban-column')?.classList.remove('drag-over');
            const idx = e.dataTransfer?.getData('text/plain');
            if (idx !== undefined) { moveTaskWithStatus(parseInt(idx), col.dataset.status as Todo['status']); }
        });
    });

    chrome.storage.local.get(['lang'], (r) => {
        currentLang = (r.lang as Language) || 'tr';
        applyI18n(currentLang, todoInput, langToggleBtn); setRandomQuote(quoteElement, currentLang); updateTime(clockElement, dateElement, currentLang); loadTodos();
    });
    setInterval(() => updateTime(clockElement, dateElement, currentLang), 1000);
});
