// Task class with the Builder Pattern
class Task {
    constructor(description) {
        this.description = description;
        this.completed = false;
        this.dueDate = null; // Added due date
    }

    setDueDate(dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    build() {
        return this;
    }

    toggleCompletion() {
        this.completed = !this.completed;
    }
}

// Memento Pattern for undo/redo
class TaskHistory {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
    }

    addState(taskList) {
        const clonedList = taskList.map(task => ({ ...task }));
        this.history.push(clonedList);
        this.currentIndex++;
    }

    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }
}

// TaskList class
class TaskList {
    constructor() {
        this.tasks = [];
        this.history = new TaskHistory();
    }

    addTask(task) {
        this.tasks.push(task);
        this.history.addState(this.tasks);
    }

    deleteTask(index) {
        if (index >= 0 && index < this.tasks.length) {
            this.tasks.splice(index, 1);
            this.history.addState(this.tasks);
        }
    }

    getTasks(filter) {
        if (filter === "all") {
            return this.tasks;
        } else if (filter === "completed") {
            return this.tasks.filter(task => task.completed);
        } else if (filter === "pending") {
            return this.tasks.filter(task => !task.completed);
        }
    }
}

// UI interactions and event listeners
// ...

// UI interactions and event listeners
const taskDescriptionInput = document.getElementById("task-description");
const dueDateInput = document.getElementById("due-date");
const addTaskBtn = document.getElementById("add-task-btn");
const filterSelect = document.getElementById("filter-select");
const taskListElement = document.getElementById("task-list");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

const taskListManager = new TaskList();

function renderTasks() {
    const filter = filterSelect.value;
    const tasks = taskListManager.getTasks(filter);

    taskListElement.innerHTML = "";
    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${task.description} - ${task.completed ? 'Completed' : 'Pending'}`;
        if (task.dueDate) {
            listItem.textContent += `, Due: ${task.dueDate}`;
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            taskListManager.deleteTask(index);
            renderTasks();
        });

        const toggleButton = document.createElement("button");
        toggleButton.textContent = task.completed ? "Mark as Pending" : "Mark as Completed";
        toggleButton.addEventListener("click", () => {
            task.toggleCompletion();
            taskListManager.history.addState(taskListManager.tasks); // Update history
            renderTasks();
        });

        listItem.appendChild(toggleButton);
        listItem.appendChild(deleteButton);
        taskListElement.appendChild(listItem);
    });
}

addTaskBtn.addEventListener("click", () => {
    const taskDescription = taskDescriptionInput.value.trim();
    const dueDate = dueDateInput.value; // Get due date from input

    if (taskDescription) {
        const newTask = new Task(taskDescription);
        if (dueDate) {
            newTask.setDueDate(dueDate);
        }
        taskListManager.addTask(newTask.build());
        taskDescriptionInput.value = "";
        dueDateInput.value = ""; // Clear the due date input
        renderTasks();
    }
});

// ...


filterSelect.addEventListener("change", renderTasks);
undoBtn.addEventListener("click", () => {
    const previousState = taskListManager.history.undo();
    if (previousState) {
        taskListManager.tasks = previousState;
        renderTasks();
    }
});
redoBtn.addEventListener("click", () => {
    const nextState = taskListManager.history.redo();
    if (nextState) {
        taskListManager.tasks = nextState;
        renderTasks();
    }
});

renderTasks();
