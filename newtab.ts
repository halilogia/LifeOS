interface Todo {
    text: string;
    completed: boolean;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    lastCompletedDate: string | null;
}

document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock') as HTMLDivElement;
    const dateElement = document.getElementById('date') as HTMLDivElement;
    const todoInput = document.getElementById('todo-input') as HTMLInputElement;
    const addButton = document.getElementById('add-btn') as HTMLButtonElement;
    const todoList = document.getElementById('todo-list') as HTMLUListElement;
    const emptyState = document.getElementById('empty-state') as HTMLDivElement;
    const quoteElement = document.getElementById('quote') as HTMLParagraphElement;
    const repeatSelect = document.getElementById('repeat-select') as HTMLSelectElement;
    const backupButton = document.getElementById('backup-btn') as HTMLButtonElement;
    const restoreButton = document.getElementById('restore-btn') as HTMLButtonElement;
    const restoreInput = document.getElementById('restore-input') as HTMLInputElement;

    const quotes: string[] = [
        '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
        '"Başlamak, başarmanın yarısıdır."',
        '"Yapılmış olması, mükemmel olmasından iyidir."',
        '"Meşgul olmaya değil, üretken olmaya odaklan."',
        '"Geleceği tahmin etmenin en iyi yolu onu yaratmaktır."',
        '"İstediğin her şey korkunun diğer tarafındadır."',
        '"Günleri sayma, günlere anlam kat."'
    ];

    // Initialize
    updateTime();
    setInterval(updateTime, 1000);
    loadTodos();
    setRandomQuote();

    function updateTime(): void {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;

        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('tr-TR', options);
    }

    function setRandomQuote(): void {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
    }

    // Todo Logic
    function loadTodos(): void {
        chrome.storage.local.get(['todos'], (result) => {
            const todos: Todo[] = (result.todos as Todo[]) || [];
            
            // Check for resets
            const wasModified = checkAndResetRepeatingTasks(todos);
            if (wasModified) {
                chrome.storage.local.set({ todos });
            }

            todoList.innerHTML = '';
            
            if (todos.length === 0) {
                emptyState.classList.add('active');
            } else {
                emptyState.classList.remove('active');
                todos.forEach((todo, index) => {
                    renderTodo(todo, index);
                });
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

    function renderTodo(todo: Todo, index: number): void {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        let repeatLabel = '';
        if (todo.repeat === 'daily') { repeatLabel = 'Günlük'; }
        if (todo.repeat === 'weekly') { repeatLabel = 'Haftalık'; }
        if (todo.repeat === 'monthly') { repeatLabel = 'Aylık'; }

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
        (li.querySelector('.delete-btn') as HTMLButtonElement).addEventListener('click', () => deleteTodo(index));

        todoList.appendChild(li);
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
            
            if (isCompleting) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function deleteTodo(index: number): void {
        const item = todoList.children[index] as HTMLLIElement;
        item.style.animation = 'slideOut 0.3s ease-out forwards';
        
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
                        alert('Yedek başarıyla yüklendi!');
                    });
                } else {
                    alert('Geçersiz yedek dosyası formatı.');
                }
            } catch (err) {
                console.error('Error parsing backup file:', err);
                alert('Yedek dosyası okunurken bir hata oluştu.');
            }
            // Reset input so the same file can be selected again
            input.value = '';
        };

        reader.readAsText(file);
    }

    // Events
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') { addTodo(); }
    });

    backupButton.addEventListener('click', backupData);
    restoreButton.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', restoreData);
});
