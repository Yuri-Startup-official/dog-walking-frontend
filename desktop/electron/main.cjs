const { app, BrowserWindow, protocol } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const APP_SCHEME = 'dogwalking';
const DEV_SERVER_URL = !app.isPackaged ? process.env.VITE_DEV_SERVER_URL : undefined;

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function isInsideDirectory(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function serveBundledApp(request) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.hostname !== 'app') {
    return new Response('Not found', { status: 404 });
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const distributionDirectory = path.resolve(app.getAppPath(), 'dist');
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.slice(1);
  let filePath = path.resolve(distributionDirectory, relativePath);

  if (!isInsideDirectory(distributionDirectory, filePath)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const fileInfo = await fs.stat(filePath);
    if (!fileInfo.isFile()) {
      return new Response('Not found', { status: 404 });
    }
  } catch {
    if (path.extname(filePath)) {
      return new Response('Not found', { status: 404 });
    }
    filePath = path.join(distributionDirectory, 'index.html');
  }

  try {
    const body = await fs.readFile(filePath);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f7f8fa',
    icon: path.join(app.getAppPath(), 'desktop', 'assets', 'dogwalking.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const trustedOrigin = DEV_SERVER_URL ? new URL(DEV_SERVER_URL).origin : `${APP_SCHEME}://app`;

  window.webContents.on('will-navigate', (event, targetUrl) => {
    try {
      if (new URL(targetUrl).origin !== trustedOrigin) event.preventDefault();
    } catch {
      event.preventDefault();
    }
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.once('ready-to-show', () => window.show());

  window.loadURL(DEV_SERVER_URL || `${APP_SCHEME}://app/`);
  return window;
}

app.whenReady().then(async () => {
  app.setAppUserModelId('com.dogwalking.app');

  if (!DEV_SERVER_URL) {
    await protocol.handle(APP_SCHEME, serveBundledApp);
  }

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
}).catch((error) => {
  console.error('Could not start DogWalking desktop:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
