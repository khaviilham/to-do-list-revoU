class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        const todoForm = document.getElementById('todoForm');
        const filterButtons = document.querySelectorAll('.filter-btn');

        todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const dateInput = document.getElementById('dateInput');
        
        const todoText = todoInput.value.trim();
        const todoDate = dateInput.value;

        // Validate input
        if (!this.validateInput(todoText, todoDate)) {
            return;
        }

        const newTodo = {
            id: Date.now(),
            text: todoText,
            date: todoDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(newTodo);
        this.saveTodos();
        this.render();
        this.updateStats();

        // Clear form
        todoInput.value = '';
        dateInput.value = '';
        
        // Remove any error messages
        this.clearErrors();
    }

    validateInput(text, date) {
        let isValid = true;
        
        // Clear previous errors
        this.clearErrors();

        // Validate text
        if (text.length === 0) {
            this.showError('todoInput', 'Please enter a task');
            isValid = false;
        } else if (text.length < 3) {
            this.showError('todoInput', 'Task must be at least 3 characters');
            isValid = false;
        } else if (text.length > 100) {
            this.showError('todoInput', 'Task must be less than 100 characters');
            isValid = false;
        }

        // Validate date
        if (!date) {
            this.showError('dateInput', 'Please select a date');
            isValid = false;
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.showError('dateInput', 'Date cannot be in the past');
                isValid = false;
            }
        }

        return isValid;
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        input.style.borderColor = '#e74c3c';
        
        let errorDiv = input.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    clearErrors() {
        const inputs = ['todoInput', 'dateInput'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            input.style.borderColor = '';
            
            const errorDiv = input.parentNode.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.classList.remove('show');
            }
        });
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        todoList.style.display = 'flex';
        emptyState.style.display = 'none';

        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="todoApp.toggleTodo(${todo.id})"></div>
                <div class="todo-content">
                    <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    <div class="todo-date">${this.formatDate(todo.date)}</div>
                </div>
                <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                    Delete
                </button>
            </li>
        `).join('');
    }

    updateStats() {
        const pendingTodos = this.todos.filter(todo => !todo.completed).length;
        const taskCount = document.getElementById('taskCount');
        
        if (pendingTodos === 0) {
            taskCount.textContent = 'All tasks completed! 🎉';
        } else if (pendingTodos === 1) {
            taskCount.textContent = '1 task remaining';
        } else {
            taskCount.textContent = `${pendingTodos} tasks remaining`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Set today as default date
    const dateInput = document.getElementById('dateInput');
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
});
