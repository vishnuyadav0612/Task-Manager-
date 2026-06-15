const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskCategory = document.getElementById('taskCategory');
const taskDue = document.getElementById('taskDue');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearAllBtn = document.getElementById('clearAllBtn');

const API_BASE = '/api/tasks';
let tasks = [];

async function fetchTasks() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to load tasks');
    tasks = await response.json();
  } catch (error) {
    tasks = [];
    alert('Unable to load tasks from the server.');
  }
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
  badge.className = `task-badge badge-${task.category}`;
  badge.textContent = task.category;

  const due = document.createElement('span');
  due.textContent = task.due ? `Due ${task.due}` : 'No due date';

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

function renderTasks() {
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

  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'} active`;
  clearAllBtn.disabled = tasks.length === 0;
}

async function addTask(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) {
    taskTitle.focus();
    return;
  }

  const payload = {
    title,
    category: taskCategory.value,
    due: taskDue.value ? new Date(taskDue.value).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
  };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to add task');

    const task = await response.json();
    tasks.push(task);
    renderTasks();
    taskForm.reset();
    taskTitle.focus();
  } catch (error) {
    alert('Unable to add task. Please try again.');
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Delete error');
    tasks = tasks.filter((task) => task.id !== id);
    renderTasks();
  } catch (error) {
    alert('Unable to delete task.');
  }
}

async function toggleDone(id) {
  const task = tasks.find((taskItem) => taskItem.id === id);
  if (!task) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    });
    if (!response.ok) throw new Error('Update error');

    const updated = await response.json();
    tasks = tasks.map((taskItem) => (taskItem.id === id ? updated : taskItem));
    renderTasks();
  } catch (error) {
    alert('Unable to update task status.');
  }
}

async function clearAllTasks() {
  if (!tasks.length) return;
  if (!confirm('Clear all tasks? This cannot be undone.')) return;

  try {
    const response = await fetch(API_BASE, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Clear error');
    tasks = [];
    renderTasks();
  } catch (error) {
    alert('Unable to clear tasks.');
  }
}

taskForm.addEventListener('submit', addTask);
clearAllBtn.addEventListener('click', clearAllTasks);

(async function initialize() {
  await fetchTasks();
  renderTasks();
})();
