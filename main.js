const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function getTasksAndInboxAndScratch() {
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  const scratchPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Scratch Pad.json');
  let tasks = [];
  let inbox = [];
  let scratch = [];
  try {
    const data = fs.readFileSync(tasksPath, 'utf-8');
    tasks = JSON.parse(data);
  } catch (e) {
    tasks = [];
  }
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = [];
  }
  try {
    if (fs.existsSync(scratchPath)) {
      scratch = JSON.parse(fs.readFileSync(scratchPath, 'utf-8'));
    }
  } catch (e) {
    scratch = [];
  }
  return { tasks, inbox, scratch };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 300,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

ipcMain.handle('get-tasks', () => {
  return getTasksAndInboxAndScratch();
});
ipcMain.on('add-task-inbox', (event, task) => {
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  let inbox = [];
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = [];
  }
  inbox.push(task);
  fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2), 'utf-8');
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('remove-task-inbox', (event, idx) => {
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  let inbox = [];
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = [];
  }
  if (idx >= 0 && idx < inbox.length) {
    inbox.splice(idx, 1);
    fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('move-task-to-queue', (event, idx) => {
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  let inbox = [];
  let tasks = [];
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = [];
  }
  try {
    if (fs.existsSync(tasksPath)) {
      tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    }
  } catch (e) {
    tasks = [];
  }
  if (idx >= 0 && idx < inbox.length) {
    const [task] = inbox.splice(idx, 1);
    tasks.push(task);
    fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2), 'utf-8');
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('remove-task-queue', (event, idx) => {
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  let tasks = [];
  try {
    if (fs.existsSync(tasksPath)) {
      tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    }
  } catch (e) {
    tasks = [];
  }
  if (idx >= 0 && idx < tasks.length) {
    tasks.splice(idx, 1);
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('add-task-scratch', (event, task) => {
  const scratchPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Scratch Pad.json');
  let scratch = [];
  try {
    if (fs.existsSync(scratchPath)) {
      scratch = JSON.parse(fs.readFileSync(scratchPath, 'utf-8'));
    }
  } catch (e) {
    scratch = [];
  }
  scratch.push(task);
  fs.writeFileSync(scratchPath, JSON.stringify(scratch, null, 2), 'utf-8');
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('remove-task-scratch', (event, idx) => {
  const scratchPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Scratch Pad.json');
  let scratch = [];
  try {
    if (fs.existsSync(scratchPath)) {
      scratch = JSON.parse(fs.readFileSync(scratchPath, 'utf-8'));
    }
  } catch (e) {
    scratch = [];
  }
  if (idx >= 0 && idx < scratch.length) {
    scratch.splice(idx, 1);
    fs.writeFileSync(scratchPath, JSON.stringify(scratch, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});
ipcMain.on('move-scratch-to-queue', (event, idx) => {
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  const scratchPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Scratch Pad.json');
  let scratch = [];
  let tasks = [];
  try {
    if (fs.existsSync(scratchPath)) {
      scratch = JSON.parse(fs.readFileSync(scratchPath, 'utf-8'));
    }
  } catch (e) {
    scratch = [];
  }
  try {
    if (fs.existsSync(tasksPath)) {
      tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    }
  } catch (e) {
    tasks = [];
  }
  if (idx >= 0 && idx < scratch.length) {
    const [task] = scratch.splice(idx, 1);
    tasks.push(task);
    fs.writeFileSync(scratchPath, JSON.stringify(scratch, null, 2), 'utf-8');
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('move-queue-to-inbox', (event, idx) => {
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  let tasks = [];
  let inbox = [];
  try {
    if (fs.existsSync(tasksPath)) {
      tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    }
  } catch (e) {
    tasks = [];
  }
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = [];
  }
  if (idx >= 0 && idx < tasks.length) {
    const [task] = tasks.splice(idx, 1);
    inbox.push(task);
    fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');
    fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2), 'utf-8');
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
