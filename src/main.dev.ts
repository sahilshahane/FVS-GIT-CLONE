/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/first */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
// require('v8-compile-cache');

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import MenuBuilder from './menu';
import logApp from './Pages/modules/log';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const QUIT = () => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  mainWindow.close();
};

const getAppHomePath = () => {
  if (process.env.NODE_ENV === 'development')
    return path.join('assets', 'installation', '.usp');

  return path.join(app.getPath('home'), '.usp');
};

const Load_CCODES = () => {
  const VALUE = {
    CCODES: '',
    CCODES_PATH: '',
  };

  try {
    const APP_HOME_PATH = getAppHomePath();

    VALUE.CCODES_PATH = path.join(APP_HOME_PATH, 'Communication_Codes.json');
    VALUE.CCODES = JSON.parse(fs.readFileSync(VALUE.CCODES_PATH).toString());
  } catch (e_) {
    logApp('Could not Load Communication Codes', e_.message);
    dialog.showErrorBox('Could not Load Communication Codes', e_.message);
    QUIT();
  }
  return VALUE;
};

let mainWindow: BrowserWindow | null = null;
const CCODES = Load_CCODES();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1366,
    height: 768,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on('get-home-path', (evt) => {
  evt.returnValue = getAppHomePath();
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.filePaths.length < 1) return null;

  return result.filePaths[0];
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
  });
  if (result.filePaths.length < 1) return null;
  return result.filePaths[0];
})

ipcMain.on('quit', (evt, args) => {
  const { message } = args;
  dialog.showErrorBox('', message);
  QUIT();
});

ipcMain.on('get-CCODES', (evt) => {
  evt.returnValue = CCODES;
});
