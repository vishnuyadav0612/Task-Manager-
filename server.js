const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const contents = fs.readFileSync(DATA_FILE, 'utf8');
    return contents ? JSON.parse(contents) : [];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

app.get('/api/tasks', (req, res) => {
  res.json(loadTasks());
});

app.post('/api/tasks', (req, res) => {
  const { title, category, due } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const tasks = loadTasks();
  const newTask = {
    id: Date.now().toString(),
    title: title.trim(),
    category: category || 'Focus',
    due: due || '',
    done: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const tasks = loadTasks();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const tasks = loadTasks().filter((task) => task.id !== id);
  saveTasks(tasks);
  res.status(204).end();
});

app.delete('/api/tasks', (req, res) => {
  saveTasks([]);
  res.status(204).end();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
