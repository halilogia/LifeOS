document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const quoteElement = document.getElementById('quote');

    const quotes = [
        '"The secret of getting ahead is getting started."',
        '"Done is better than perfect."',
        '"The way to get started is to quit talking and begin doing."',
        '"Focus on being productive instead of busy."',
        '"The best way to predict the future is to create it."',
        '"Everything you’ve ever wanted is on the other side of fear."',
        '"Don’t count the days, make the days count."'
    ];

    // Initialize
    updateTime();
    setInterval(updateTime, 1000);
    loadTodos();
    setRandomQuote();

    // Time & Date
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
            const todos = result.todos || [];
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

    function renderTodo(todo, index) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="checkbox">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span class="todo-text">${todo.text}</span>
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
        if (text) {
            chrome.storage.local.get(['todos'], (result) => {
                const todos = result.todos || [];
                todos.push({ text, completed: false });
                chrome.storage.local.set({ todos }, () => {
                    todoInput.value = '';
                    loadTodos();
                });
            });
        }
    }

    function toggleTodo(index) {
        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            todos[index].completed = !todos[index].completed;
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
