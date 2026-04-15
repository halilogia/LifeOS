document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const quoteElement = document.getElementById('quote');
    const repeatSelect = document.getElementById('repeat-select');

    const quotes = [
        '"Başlamak, başarmanın yarısıdır."',
        '"Yapılmış olması, mükemmel olmasından iyidir."',
        '"Başlamanın yolu konuşmayı bırakıp yapmaya başlamaktır."',
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

    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;

        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('tr-TR', options);
    }

    function setRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
    }

    // Todo Logic
    function loadTodos() {
        chrome.storage.local.get(['todos'], (result) => {
            let todos = result.todos || [];
            
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

    function checkAndResetRepeatingTasks(todos) {
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
                    // Check if it's a new week (using Monday as start)
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

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        monday.setHours(0,0,0,0);
        return monday;
    }

    function renderTodo(todo, index) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        let repeatLabel = '';
        if (todo.repeat === 'daily') repeatLabel = 'Günlük';
        if (todo.repeat === 'weekly') repeatLabel = 'Haftalık';
        if (todo.repeat === 'monthly') repeatLabel = 'Aylık';

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

        li.querySelector('.checkbox').addEventListener('click', () => toggleTodo(index));
        li.querySelector('.todo-text').addEventListener('click', () => toggleTodo(index));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(index));

        todoList.appendChild(li);
    }

    function addTodo() {
        const text = todoInput.value.trim();
        const repeat = repeatSelect.value;
        if (text) {
            chrome.storage.local.get(['todos'], (result) => {
                const todos = result.todos || [];
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

    function toggleTodo(index) {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            const isCompleting = !todos[index].completed;
            todos[index].completed = isCompleting;
            
            if (isCompleting) {
                todos[index].lastCompletedDate = new Date().toISOString();
            }
            
            chrome.storage.local.set({ todos }, loadTodos);
        });
    }

    function deleteTodo(index) {
        const item = todoList.children[index];
        item.style.animation = 'slideOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            chrome.storage.local.get(['todos'], (result) => {
                const todos = result.todos || [];
                todos.splice(index, 1);
                chrome.storage.local.set({ todos }, loadTodos);
            });
        }, 300);
    }

    // Events
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
});
