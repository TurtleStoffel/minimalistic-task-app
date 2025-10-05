# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a minimalistic Electron desktop task manager with an always-on-top floating window.

### Data Storage

The application uses JSON files for persistent storage. The data folder location is configurable via `config.json`:

```json
{
  "dataFolder": "~/coding/task-manager-data"
}
```

**Data files** (stored in the configured data folder):
- `task-queue.json`: Main task queue
- `Task Inbox.json`: Inbox for tasks to be processed
- `Task Scratch Pad.json`: Quick notes and temporary thoughts

### Application Structure

**Main Process (`main.js`)**:
- Electron main process handling window creation and IPC communication
- Manages file I/O operations for all three JSON data files
- Creates a fixed-size, always-on-top, non-resizable window (350x300)
- Handles task operations: add, remove, move between lists

**Renderer Process (`index.html`)**:
- Single-file UI with embedded JavaScript and CSS
- Two-tab interface: "Tasks" (queue + scratch pad) and "Inbox"
- Dark/light mode toggle using CSS variables and localStorage
- Uses Tailwind CSS from CDN for styling
- Real-time updates via IPC events

### IPC Communication

**Handlers** (main.js):
- `get-tasks`: Returns all three task lists
- `add-task-inbox`, `add-task-scratch`: Add new tasks
- `remove-task-inbox`, `remove-task-queue`, `remove-task-scratch`: Delete tasks
- `move-task-to-queue`, `move-task-to-scratch`: Move tasks from inbox
- `move-queue-to-inbox`, `move-scratch-to-queue`, `move-scratch-to-inbox`: Move between lists

**Events** (index.html):
- `tasks-updated`: Broadcasted to all windows when data changes, triggers UI refresh
