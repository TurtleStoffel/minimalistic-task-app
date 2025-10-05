const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Config management
function getConfig() {
  const configPath = path.join(__dirname, 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return { dataFolder: './data' };
  }
}

function expandHome(filepath) {
  if (filepath.startsWith('~/')) {
    return path.join(require('os').homedir(), filepath.slice(2));
  }
  return filepath;
}

const config = getConfig();
const TASK_QUEUE_DIR = path.resolve(expandHome(config.dataFolder));

function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
  }
  return [];
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing file ${filePath}:`, e);
  }
}

function getTasksAndInboxAndScratch() {
  const inboxPath = path.join(TASK_QUEUE_DIR, 'Task Inbox.json');
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');

  const inbox = readJsonFile(inboxPath);
  const scratch = readJsonFile(scratchPath);

  return { inbox, scratch };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 350,
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
  const inboxPath = path.join(TASK_QUEUE_DIR, 'Task Inbox.json');
  const inbox = readJsonFile(inboxPath);
  inbox.push(task);
  writeJsonFile(inboxPath, inbox);
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('move-task-to-scratch', (event, idx) => {
  const inboxPath = path.join(TASK_QUEUE_DIR, 'Task Inbox.json');
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');
  const inbox = readJsonFile(inboxPath);
  const scratch = readJsonFile(scratchPath);
  if (idx >= 0 && idx < inbox.length) {
    const [task] = inbox.splice(idx, 1);
    scratch.push(task);
    writeJsonFile(inboxPath, inbox);
    writeJsonFile(scratchPath, scratch);
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('remove-task-inbox', (event, idx) => {
  const inboxPath = path.join(TASK_QUEUE_DIR, 'Task Inbox.json');
  const inbox = readJsonFile(inboxPath);
  if (idx >= 0 && idx < inbox.length) {
    inbox.splice(idx, 1);
    writeJsonFile(inboxPath, inbox);
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('add-task-scratch', (event, task) => {
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');
  const scratch = readJsonFile(scratchPath);
  scratch.push(task);
  writeJsonFile(scratchPath, scratch);
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('remove-task-scratch', (event, idx) => {
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');
  const scratch = readJsonFile(scratchPath);
  if (idx >= 0 && idx < scratch.length) {
    scratch.splice(idx, 1);
    writeJsonFile(scratchPath, scratch);
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('move-scratch-to-inbox', (event, idx) => {
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');
  const inboxPath = path.join(TASK_QUEUE_DIR, 'Task Inbox.json');
  const scratch = readJsonFile(scratchPath);
  const inbox = readJsonFile(inboxPath);
  if (idx >= 0 && idx < scratch.length) {
    const [task] = scratch.splice(idx, 1);
    inbox.push(task);
    writeJsonFile(scratchPath, scratch);
    writeJsonFile(inboxPath, inbox);
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

ipcMain.on('reorder-scratch', (event, { fromIndex, toIndex }) => {
  const scratchPath = path.join(TASK_QUEUE_DIR, 'Task Scratch Pad.json');
  const scratch = readJsonFile(scratchPath);
  if (fromIndex >= 0 && fromIndex < scratch.length && toIndex >= 0 && toIndex < scratch.length) {
    const [task] = scratch.splice(fromIndex, 1);
    scratch.splice(toIndex, 0, task);
    writeJsonFile(scratchPath, scratch);
  }
  BrowserWindow.getAllWindows().forEach(win => win.webContents.send('tasks-updated'));
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
