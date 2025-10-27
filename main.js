
const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

function createWindow() {
  app.on('web-contents-created', (_e, contents) => {
    contents.on('will-attach-webview', (e) => e.preventDefault());
  });

  const preloadPath = path.join(__dirname, 'preload.js');
  const hasPreload = fs.existsSync(preloadPath);

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 860,
    minHeight: 600,
    title: 'Matrix Chat PWA',
    show: false,                     // з’явиться після повного рендеру
    backgroundColor: '#f0f2f5',
    icon: path.join(__dirname, 'icons', 'icon-192.png'),
    webPreferences: {
      // якщо preload немає — не передаємо шлях взагалі
      ...(hasPreload ? { preload: preloadPath } : {}),
      contextIsolation: true,        // безпека
      nodeIntegration: false,        // без node в рендері
      sandbox: true,                 // пісочниця
      webSecurity: true,
      devTools: isDev
    }
  });

  // Показати лише коли все готово
  win.once('ready-to-show', () => win.show());

  // Діагностика проблем із завантаженням (білий екран тощо)
  win.webContents.on('did-fail-load', (_e, errorCode, errorDesc, validatedURL) => {
    console.error('[did-fail-load]', { errorCode, errorDesc, validatedURL });
    dialog.showErrorBox(
      'Помилка завантаження',
      `Сторінку не завантажено.\n${errorDesc} (${errorCode})\nURL: ${validatedURL || 'file://index.html'}`
    );
  });

  win.webContents.on('render-process-gone', (_e, details) => {
    console.error('[render-process-gone]', details);
    dialog.showErrorBox('Помилка рендерера', `Процес рендерера завершився: ${details.reason}`);
  });

  if (isDev) {
    // зручно відкрити DevTools внизу
    win.webContents.once('dom-ready', () => {
      win.webContents.openDevTools({ mode: 'detach' });
    });
  }

  // Завантажуємо локальний index.html
  win.loadFile('index.html');

  // Відкривати зовнішні посилання у браузері
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Блокуємо небажану навігацію всередині додатку
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // macOS: відкрити нове вікно, якщо всі закриті і клік по іконці
  app.on('activate', () => {
    const { BrowserWindow } = require('electron');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Закрити додаток коли всі вікна зачинені (крім macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});