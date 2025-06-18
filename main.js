const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

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

  // Read tasks from the JSON files
  const tasksPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'task-queue.json');
  const inboxPath = path.join('C:', 'Users', 'stefa', 'coding', 'task-queue', 'Task Inbox.json');
  let tasks = [];
  let inbox = [];
  try {
    const data = fs.readFileSync(tasksPath, 'utf-8');
    tasks = JSON.parse(data);
  } catch (e) {
    tasks = ['Could not read tasks'];
  }
  try {
    if (fs.existsSync(inboxPath)) {
      inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'));
    }
  } catch (e) {
    inbox = ['Could not read inbox'];
  }

  // Generate HTML for tasks and inbox
  const tasksHtml = Array.isArray(tasks) && tasks.length > 0
    ? `<ul style='padding:0 0.5em;margin:0;font-size:11px;'>${tasks.map(t => `<li style="margin-bottom:2px;">${typeof t === 'string' ? t : JSON.stringify(t)}</li>`).join('')}</ul>`
    : '<p style="margin:0;font-size:11px;">No tasks found.</p>';
  const inboxHtml = Array.isArray(inbox) && inbox.length > 0
    ? `<ul style='padding:0 0.5em;margin:0;font-size:11px;'>${inbox.map(t => `<li style="margin-bottom:2px;">${typeof t === 'string' ? t : JSON.stringify(t)}</li>`).join('')}</ul>`
    : '<p style="margin:0;font-size:11px;">No inbox tasks found.</p>';

  win.loadURL('data:text/html,' +
    encodeURIComponent(`
      <html>
        <body style="display:flex;align-items:center;justify-content:flex-start;height:100%;margin:0;flex-direction:column;background:#fff;">
          <h1 style='margin:2px 0 0 0;font-size:13px;font-weight:600;'>Tasks</h1>
          <div style='width:100%;text-align:left;flex:1 1 auto;'>${tasksHtml}</div>
          <h2 style='margin:4px 0 0 0;font-size:12px;font-weight:600;'>Task Inbox</h2>
          <div style='width:100%;text-align:left;flex:1 1 auto;'>${inboxHtml}</div>
          <form id="taskForm" style="width:98%;margin:4px auto 0 auto;display:flex;gap:2px;">
            <input id="taskInput" type="text" placeholder="New task..." style="flex:1;padding:2px 4px;font-size:11px;" required />
            <button type="submit" style="padding:2px 8px;font-size:11px;">+</button>
          </form>
          <script>
            const { ipcRenderer } = require('electron');
            document.getElementById('taskForm').addEventListener('submit', function(e) {
              e.preventDefault();
              const value = document.getElementById('taskInput').value.trim();
              if (value) {
                ipcRenderer.send('add-task-inbox', value);
                document.getElementById('taskInput').value = '';
              }
            });
          </script>
        </body>
      </html>
    `)
  );
}

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
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});