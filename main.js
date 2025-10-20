// main.js

// Імпортуємо модулі Electron
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Функція для створення головного вікна
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // дозволяє використовувати Node.js у фронтенді
      contextIsolation: false
    }
  });

  // Завантажуємо HTML-сторінку
  win.loadFile('index.html');

  // Опціонально — відкриваємо DevTools
  // win.webContents.openDevTools();
};

// Коли Electron готовий — створюємо вікно
app.whenReady().then(() => {
  createWindow();

  // Для macOS — створюємо нове вікно, якщо немає жодного відкритого
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Закриваємо застосунок, коли всі вікна закриті (крім macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
