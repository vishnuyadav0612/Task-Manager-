const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskCategory = document.getElementById('taskCategory');
const taskDue = document.getElementById('taskDue');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearAllBtn = document.getElementById('clearAllBtn');

const STORAGE_KEY = 'colorfulTaskManager.tasks';
let tasks = [];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
  } catch (error) {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.dataset.id = task.id;

  const details = document.createElement('div');
  details.className = 'task-details';

  const title = document.createElement('h3');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const badge = document.createElement('span');
  badge.className = 	ask-badge badge-;
  badge.textContent = task.category;

  const due = document.createElement('span');
  due.textContent = task.due ? Due  : 'No due date';

  meta.append(badge, due);
  details.append(title, meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.textContent = task.done ? 'Undo' : 'Complete';
  doneBtn.onclick = () => toggleDone(task.id);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => deleteTask(task.id);

  actions.append(doneBtn, deleteBtn);
  card.append(details, actions);

  if (task.done) {
    card.style.opacity = '0.72';
    card.style.filter = 'grayscale(0.15)';
  }

  return card;
}

function updateTaskList() {
  taskList.innerHTML = '';

  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Your workspace is clear. Add a bright task to start creating momentum.';
    taskList.appendChild(empty);
  } else {
    tasks.slice().reverse().forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  taskCount.textContent = ${tasks.length} task active;
  clearAllBtn.disabled = tasks.length === 0;
}

function addTask(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) {
    taskTitle.focus();
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    category: taskCategory.value,
    due: taskDue.value ? new Date(taskDue.value).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
    done: false,
  };

  tasks.push(newTask);
  saveTasks();
  updateTaskList();
  taskForm.reset();
  taskTitle.focus();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  updateTaskList();
}

function toggleDone(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  saveTasks();
  updateTaskList();
}

function clearAllTasks() {
  if (!tasks.length) return;
  if (!confirm('Clear all tasks? This cannot be undone.')) return;

  tasks = [];
  saveTasks();
  updateTaskList();
}

taskForm.addEventListener('submit', addTask);
clearAllBtn.addEventListener('click', clearAllTasks);

loadTasks();
updateTaskList();
