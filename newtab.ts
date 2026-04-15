interface Todo {
    text: string;
    completed: boolean;
    status: 'todo' | 'in-progress' | 'done';
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    lastCompletedDate: string | null;
}

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

    type Language = 'tr' | 'en';
    let currentLang: Language = 'tr';

    const translations = {
        tr: {
            view_list: 'Liste',
            view_kanban: 'Kanban',
            greeting: 'Bugünkü odağın nedir?',
            todo_placeholder: 'Yeni görev ekle...',
            repeat_none: 'Tekrar Yok',
            repeat_daily: 'Günlük',
            repeat_weekly: 'Haftalık',
            repeat_monthly: 'Aylık',
            section_tasks: 'Odağım',
            section_recurring: 'Rutinler & Alışkanlıklar',
            empty_state: 'Her şey tamam! Biraz dinlenme zamanı.',
            backup: 'Yedek Al',
            restore: 'Yedekten Yükle',
            kanban_todo: 'Yapılacak',
            kanban_in_progress: 'Yapılıyor',
            kanban_done: 'Bitti',
            settings_title: 'Ayarlar',
            settings_data_title: 'Veri Yönetimi',
            clear_all: 'Tüm Verileri Temizle',
            alert_restore_success: 'Yedek başarıyla yüklendi!',
            alert_restore_invalid: 'Geçersiz yedek dosyası formatı.',
            alert_restore_error: 'Yedek dosyası okunurken bir hata oluştu.',
            alert_clear_confirm: 'Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            quote_1: '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
            quote_2: '"Başlamak, başarmanın yarısıdır."',
            quote_3: '"Yapılmış olması, mükemmel olmasından iyidir."',
            quote_4: '"Meşgul olmaya değil, üretken olmaya odaklan."',
            quote_5: '"Geleceği tahmin etmenin en iyi yolu onu yaratmaktır."',
            quote_6: '"İstediğin her şey korkunun diğer tarafındadır."',
            quote_7: '"Günleri sayma, günlere anlam kat."'
        },
        en: {
            view_list: 'List',
            view_kanban: 'Kanban',
            greeting: "What's your focus for today?",
            todo_placeholder: 'Add a new task...',
            repeat_none: 'No Repeat',
            repeat_daily: 'Daily',
            repeat_weekly: 'Weekly',
            repeat_monthly: 'Monthly',
            section_tasks: 'My Focus',
            section_recurring: 'Routines & Habits',
            empty_state: 'All done! Time for some rest.',
            backup: 'Backup',
            restore: 'Restore',
            kanban_todo: 'To Do',
            kanban_in_progress: 'Doing',
            kanban_done: 'Done',
            settings_title: 'Settings',
            settings_data_title: 'Data Management',
            clear_all: 'Clear All Data',
            alert_restore_success: 'Backup restored successfully!',
            alert_restore_invalid: 'Invalid backup file format.',
            alert_restore_error: 'An error occurred while reading the backup file.',
            alert_clear_confirm: 'Are you sure you want to clear all data? This action cannot be undone.',
            quote_1: '"The secret of getting ahead is getting started."',
            quote_2: '"Well begun is half done."',
            quote_3: '"Done is better than perfect."',
            quote_4: '"Focus on being productive instead of busy."',
            quote_5: '"The best way to predict the future is to create it."',
            quote_6: '"Everything you want is on the other side of fear."',
            quote_7: '"Don’t count the days, make the days count."'
        }
    };

    // Initialize
    initLanguage();
    updateTime();
    setInterval(updateTime, 1000);
    loadTodos();

    function initLanguage(): void {
        chrome.storage.local.get(['lang'], (result) => {
            currentLang = (result.lang as Language) || 'tr';
            applyTranslations();
            setRandomQuote();
        });
    }

    function toggleLanguage(): void {
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        chrome.storage.local.set({ lang: currentLang }, () => {
            applyTranslations();
            setRandomQuote();
            updateTime();
            loadTodos();
        });
    }

    function applyTranslations(): void {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n') as keyof typeof translations['tr'];
            if (translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        // Update placeholder
        todoInput.placeholder = translations[currentLang].todo_placeholder;
        // Update toggle button text (opposite of current)
        langToggleBtn.textContent = currentLang === 'tr' ? 'EN' : 'TR';
    }

    function updateTime(): void {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;

        const locale = currentLang === 'tr' ? 'tr-TR' : 'en-US';
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString(locale, options);
    }

    function setRandomQuote(): void {
        const quoteKeys = ['quote_1', 'quote_2', 'quote_3', 'quote_4', 'quote_5', 'quote_6', 'quote_7'];
        const randomKey = quoteKeys[Math.floor(Math.random() * quoteKeys.length)] as keyof typeof translations['tr'];
        quoteElement.textContent = translations[currentLang][randomKey];
    }

    // Todo Logic
    function loadTodos(): void {
        chrome.storage.local.get(['todos'], (result) => {
            let todos: Todo[] = (result.todos as Todo[]) || [];
            
            // Data Migration for Status
            let needsSave = false;
            todos = todos.map(todo => {
                if (!todo.status) {
                    todo.status = todo.completed ? 'done' : 'todo';
                    needsSave = true;
                }
                return todo;
            });

            // Check for resets
            const wasModified = checkAndResetRepeatingTasks(todos);
            if (wasModified || needsSave) {
                chrome.storage.local.set({ todos });
            }

            // Clear all lists
            todoList.innerHTML = '';
            recurringList.innerHTML = '';
            kanbanTodo.innerHTML = '';
            kanbanInProgress.innerHTML = '';
            kanbanDone.innerHTML = '';
            
            let oneTimeCount = 0;
            let recurringCount = 0;

            todos.forEach((todo, index) => {
                // List View Rendering
                if (todo.repeat === 'none') {
                    renderTodo(todo, index, todoList);
                    oneTimeCount++;
                } else {
                    renderTodo(todo, index, recurringList);
                    recurringCount++;
                }

                // Kanban View Rendering
                renderKanbanItem(todo, index);
            });

            // Toggle visibility of sections in List View
            tasksSection.style.display = oneTimeCount > 0 ? 'block' : 'none';
            recurringSection.style.display = recurringCount > 0 ? 'block' : 'none';
            
            if (oneTimeCount === 0 && recurringCount === 0) {
                emptyState.classList.add('active');
            } else {
                emptyState.classList.remove('active');
            }
        });
    }

    function checkAndResetRepeatingTasks(todos: Todo[]): boolean {
        const now = new Date();
        const nowString = now.toDateString();
        let modified = false;

        todos.forEach(todo => {
            if (todo.repeat && todo.repeat !== 'none' && todo.completed && todo.lastCompletedDate) {
                const lastDate = new Date(todo.lastCompletedDate);
                let shouldReset = false;

                if (todo.repeat === 'daily') {
                    if (nowString !== lastDate.toDateString()) {
                        shouldReset = true;
                    }
                } else if (todo.repeat === 'weekly') {
                    const lastWeekStart = getStartOfWeek(lastDate);
                    const currentWeekStart = getStartOfWeek(now);
                    if (currentWeekStart.getTime() > lastWeekStart.getTime()) {
                        shouldReset = true;
                    }
                } else if (todo.repeat === 'monthly') {
                    if (now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear()) {
                        shouldReset = true;
                    }
                }

                if (shouldReset) {
                    todo.completed = false;
                    modified = true;
                }
            }
        });
        return modified;
    }

    function getStartOfWeek(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0,0,0,0);
        return monday;
    }

    function renderTodo(todo: Todo, index: number, targetList: HTMLUListElement): void {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        let repeatLabel = '';
        if (todo.repeat === 'daily') { repeatLabel = translations[currentLang].repeat_daily; }
        if (todo.repeat === 'weekly') { repeatLabel = translations[currentLang].repeat_weekly; }
        if (todo.repeat === 'monthly') { repeatLabel = translations[currentLang].repeat_monthly; }

        const repeatBadge = repeatLabel ? `<span class="repeat-badge">${repeatLabel}</span>` : '';

        li.innerHTML = `
            <div class="checkbox">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="todo-text">${todo.text}</span>
            ${repeatBadge}
            <button class="delete-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        (li.querySelector('.checkbox') as HTMLDivElement).addEventListener('click', () => toggleTodo(index));
        (li.querySelector('.todo-text') as HTMLSpanElement).addEventListener('click', () => toggleTodo(index));
        (li.querySelector('.delete-btn') as HTMLButtonElement).addEventListener('click', () => deleteTodo(index, li));

        targetList.appendChild(li);
    }

    function renderKanbanItem(todo: Todo, index: number): void {
        const item = document.createElement('div');
        item.className = 'kanban-item';
        item.setAttribute('draggable', 'true');
        item.dataset.index = index.toString();
        
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

        item.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', index.toString());
                item.classList.add('dragging');
            }
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });

        item.querySelector('.move-left')?.addEventListener('click', () => moveTask(index, -1));
        item.querySelector('.move-right')?.addEventListener('click', () => moveTask(index, 1));

        if (todo.status === 'todo') kanbanTodo.appendChild(item);
        if (todo.status === 'in-progress') kanbanInProgress.appendChild(item);
        if (todo.status === 'done') kanbanDone.appendChild(item);
    }

    function moveTaskWithStatus(index: number, newStatus: Todo['status']): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            if (todos[index].status === newStatus) return;

            todos[index].status = newStatus;
            todos[index].completed = newStatus === 'done';
            if (todos[index].completed) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function moveTask(index: number, direction: number): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            const statuses: Todo['status'][] = ['todo', 'in-progress', 'done'];
            const currentIdx = statuses.indexOf(todos[index].status);
            const nextIdx = currentIdx + direction;

            if (nextIdx >= 0 && nextIdx < statuses.length) {
                moveTaskWithStatus(index, statuses[nextIdx]);
            }
        });
    }

    function addTodo(): void {
        const text = todoInput.value.trim();
        const repeat = repeatSelect.value as Todo['repeat'];
        if (text) {
            chrome.storage.local.get(['todos'], (result) => {
                const todos: Todo[] = (result.todos as Todo[]) || [];
                todos.push({ 
                    text, 
                    completed: false, 
                    status: 'todo',
                    repeat, 
                    lastCompletedDate: null 
                });
                chrome.storage.local.set({ todos }, () => {
                    todoInput.value = '';
                    repeatSelect.value = 'none';
                    loadTodos();
                });
            });
        }
    }

    function toggleTodo(index: number): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            const isCompleting = !todos[index].completed;
            todos[index].completed = isCompleting;
            
            // Sync status
            todos[index].status = isCompleting ? 'done' : 'todo';
            
            if (isCompleting) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function switchView(view: 'list' | 'kanban'): void {
        if (view === 'list') {
            navListBtn.classList.add('active');
            navKanbanBtn.classList.remove('active');
            listView.classList.add('active');
            kanbanView.classList.remove('active');
        } else {
            navKanbanBtn.classList.add('active');
            navListBtn.classList.remove('active');
            kanbanView.classList.add('active');
            listView.classList.remove('active');
        }
    }

    function deleteTodo(index: number, element: HTMLLIElement): void {
        element.style.animation = 'slideOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            chrome.storage.local.get(['todos'], (result) => {
                const todos: Todo[] = (result.todos as Todo[]) || [];
                todos.splice(index, 1);
                chrome.storage.local.set({ todos }, loadTodos);
            });
        }, 300);
    }

    function backupData(): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            const dataStr = JSON.stringify(todos, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        });
    }

    function restoreData(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const todos = JSON.parse(content);
                
                if (Array.isArray(todos)) {
                    chrome.storage.local.set({ todos }, () => {
                        loadTodos();
                        alert(translations[currentLang].alert_restore_success);
                    });
                } else {
                    alert(translations[currentLang].alert_restore_invalid);
                }
            } catch (err) {
                console.error('Error parsing backup file:', err);
                alert(translations[currentLang].alert_restore_error);
            }
            // Reset input so the same file can be selected again
            input.value = '';
        };

        reader.readAsText(file);
    }

    function clearAllData(): void {
        const confirmMsg = translations[currentLang].alert_clear_confirm;
        if (confirm(confirmMsg)) {
            chrome.storage.local.clear(() => {
                // Restore language preference after clear
                chrome.storage.local.set({ lang: currentLang }, () => {
                    loadTodos();
                    settingsPanel.classList.remove('active');
                });
            });
        }
    }

    // Events
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') { addTodo(); }
    });

    backupButton.addEventListener('click', backupData);
    restoreButton.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', restoreData);

    navListBtn.addEventListener('click', () => switchView('list'));
    navKanbanBtn.addEventListener('click', () => switchView('kanban'));
    langToggleBtn.addEventListener('click', toggleLanguage);

    settingsBtn.addEventListener('click', () => settingsPanel.classList.add('active'));
    settingsClose.addEventListener('click', () => settingsPanel.classList.remove('active'));
    clearAllBtn.addEventListener('click', clearAllData);

    // Close settings panel when clicking outside
    settingsPanel.addEventListener('click', (e) => {
        if (e.target === settingsPanel) {
            settingsPanel.classList.remove('active');
        }
    });

    // Drag and Drop Listeners for Kanban Columns
    [kanbanTodo, kanbanInProgress, kanbanDone].forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.closest('.kanban-column')?.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => {
            col.closest('.kanban-column')?.classList.remove('drag-over');
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.closest('.kanban-column')?.classList.remove('drag-over');
            const index = e.dataTransfer?.getData('text/plain');
            if (index !== undefined) {
                const status = col.dataset.status as Todo['status'];
                moveTaskWithStatus(parseInt(index), status);
            }
        });
    });
});
