# Zen Addons Manager

A modern, Electron-based World of Warcraft addon manager built with Angular and Tailwind CSS.

## Features

- **Addon Management**: Install, enable, disable, and delete addons.
- **Multi-Version Support**: Manage addons for different WoW versions (WotLK, Cataclysm, MoP, etc.).
- **Git Integration**: Install addons directly from Git repositories and switch branches.
- **Import/Export**: Backup and share your addon lists via JSON.
- **Sub-addons**: View and manage nested addon modules.
- **Modern UI**: sleek, dark-themed interface with responsive design.

## Development

### Prerequisites

- Node.js
- npm

### Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

**Development Mode:**
Run the Angular dev server and Electron app concurrently:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run electron:start
```

**Production Mode:**
Build the Angular app and run it in Electron:
```bash
npm run electron:prod
```

### Packaging

To create a Windows installer (`.exe`):
```bash
npm run package
```
