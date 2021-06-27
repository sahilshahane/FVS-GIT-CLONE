/* eslint-disable import/no-cycle */
/* eslint global-require: off, no-console: off */
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
  Notification,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { PythonShell } from 'python-shell';
import fs from 'fs-extra';
import os from 'os';
import MenuBuilder from './menu';
import { NotificationInfo } from './modules/GlobalHandler';

const TAG = 'main.dev.ts > ';

const getAppHomePath = () => {
  if (process.env.NODE_ENV === 'development')
    return path.join('assets', 'installation', '.usp');

  return path.join(app.getPath('home'), '.usp');
};

const Error_Dialog = (title: string, message: string) => {
  dialog.showErrorBox(title, message);
};

try {
  if (
    process.env.NODE_ENV !== 'development' &&
    !fs.pathExistsSync(getAppHomePath())
  ) {
    const productionUSPFolder = path.join(
      process.resourcesPath,
      'assets',
      'installation',
      'production'
    );
    const APP_HOME_PATH = getAppHomePath();
    fs.copySync(productionUSPFolder, APP_HOME_PATH);
  }
} catch (error) {
  Error_Dialog(
    'First Time Installation',
    'Something went wrong while performing first time installtion'
  );
}

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
    log.error('Could not Load Communication Codes', e_.message);

    dialog.showErrorBox('Could not Load Communication Codes', e_.message);
    QUIT();
  }
  return VALUE;
};

// const Error_Dialog = (title: string, message: string) => {
//   dialog.showErrorBox(title, message);
// };

let mainWindow: BrowserWindow = null;
const CCODES = Load_CCODES();
const APP_HOME_PATH = getAppHomePath();
let pythonScheduler: PythonShell;

const platforms = {
  WINDOWS: 'WINDOWS',
  MAC: 'MAC',
  LINUX: 'LINUX',
  SUN: 'SUN',
  OPENBSD: 'OPENBSD',
  ANDROID: 'ANDROID',
  AIX: 'AIX',
};

const platformsNames = {
  win32: platforms.WINDOWS,
  darwin: platforms.MAC,
  linux: platforms.LINUX,
  sunos: platforms.SUN,
  openbsd: platforms.OPENBSD,
  android: platforms.ANDROID,
  aix: platforms.AIX,
};

// ------------------------------PYTHON_SERVER---------------------------------------------------------
// ------------------------------PYTHON_SERVER---------------------------------------------------------
// ------------------------------PYTHON_SERVER---------------------------------------------------------
const Create_PythonScheduler = () => {
  try {
    fs.unlinkSync('scheduler-logs.txt');
  } catch (error) {}

  let pythonBinaryPath = path.join('Scripts', 'python.exe');

  if (platformsNames[os.platform()] === platforms.LINUX)
    pythonBinaryPath = path.join('bin', 'python');

  const OPTIONS = {
    mode: 'json',
    pythonPath: path.join(
      __dirname,
      'pythonScripts',
      '.venv',
      pythonBinaryPath
    ),
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, 'pythonScripts'),
    args: ['-node'],
  };

  if (process.env.NODE_ENV === 'development') {
    OPTIONS.args = [...OPTIONS.args, '-dev'];
  }

  const serverScript = new PythonShell('scheduler.py', OPTIONS);

  serverScript.on('error', (err) => {
    log.error(err);
    Error_Dialog('Error', String(err));
  });

  serverScript.on('message', (data) => {
    log.info('Received response : ', data);

    mainWindow.webContents.send('scheduler-response', data);
  });

  serverScript.on('stderr', (err) => {
    log.error(err);
  });

  ipcMain.on('scheduler-task', (evt, task) => {
    log.info('Received a Task', task);
    serverScript.send(task);
  });

  return serverScript;
};
// ------------------------------_____________---------------------------------------------------------
// ------------------------------_____________---------------------------------------------------------
// ------------------------------_____________---------------------------------------------------------

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    center: true,
    width: 1024,
    height: 728,
    minWidth: 600,
    minHeight: 600,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // ASSIGN PYTHON SCHEDULER ///////////////////////////////////////////
  pythonScheduler = Create_PythonScheduler(); // /////////////////////////////////////////
  // //////////////////////////////////////////////////////////////////
  mainWindow.loadURL(`file://${__dirname}/index.html`);

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

  let savedOnce = false;

  mainWindow.on('close', (e) => {
    if (!savedOnce) {
      e.preventDefault();
      mainWindow.webContents.send('save-on-exit');
      savedOnce = true;
    }
  });

  // mainWindow.on('closed', () => {
  //   mainWindow = null;
  // });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
};

const stopPythonServer = () => {
  ipcMain.removeAllListeners('scheduler-task');
  if (pythonScheduler) {
    log.info(TAG, 'Stopping Python Server...');
    pythonScheduler.end((err, exitcode, exitsignal) => {
      if (err) log.error(`Python Exit Error : ${err}`);
      log.info(`Python Exit Code : ${exitcode}`);
      log.info(`Python Exit Sigal : ${exitsignal}`);
    });
  }
};

export const restartPythonServer = () => {
  if (process.env.NODE_ENV === 'development') {
    stopPythonServer();
    log.info(TAG, 'Restarting Python Server...');
    pythonScheduler = Create_PythonScheduler();
  }
};

export const clearAllRepositories = () => {
  mainWindow.webContents.send('clear-user-repositories');
};

export const SaveRepositories = () => {
  mainWindow.webContents.send('save-user-repositories');
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

ipcMain.handle('select-dialog', async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);

  if (result.filePaths.length < 1) return null;

  return result.filePaths[0];
});

ipcMain.on('quit', (_, args) => {
  const { message } = args;
  dialog.showErrorBox('', message);
  QUIT();
});

ipcMain.on('get-CCODES', (evt) => {
  evt.returnValue = CCODES;
});

ipcMain.on('get-APP_HOME_PATH', (evt) => {
  evt.returnValue = APP_HOME_PATH;
});

ipcMain.on('exit-normal', () => {
  stopPythonServer();
  app.quit();
});

ipcMain.on('restart-python-server', () => {
  restartPythonServer();
});

ipcMain.on('show-notification', (evt, notificationInfo: NotificationInfo) => {
  console.log(notificationInfo);
  new Notification(notificationInfo).show();
});
