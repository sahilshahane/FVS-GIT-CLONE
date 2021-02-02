/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import electron, { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import log from './log';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Load_APP_HOME_PATH = () => {
  try {
    return electron.remote.getGlobal('APP_HOME_PATH');
  } catch (e_) {
    log('Could Not Load App Home Path', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could Not Load App Home Path\n\n${e_}`,
    });
  }
  return '';
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const APP_HOME_PATH = Load_APP_HOME_PATH();

export const APP_SETTINGS_FILE_PATH = path.join(
  APP_HOME_PATH,
  'Appsetting.json'
);

export const USER_REPOSITORY_DATA_FILE_PATH = path.join(
  APP_HOME_PATH,
  'info.json'
);
export const SYNC_DATA_FILE_PATH = path.join(APP_HOME_PATH, 'Sync.json');
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const Load_APPSETTINGS = () => {
  try {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return JSON.parse(fs.readFileSync(APP_SETTINGS_FILE_PATH).toString());

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  } catch (e_) {
    log('Could not Load App Settings', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load App Settings\n\n${e_}`,
    });
  }
  return { APP_SETTINGS: '', APP_SETTINGS_FILE_PATH: '' };
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const Load_CCODES = () => {
  return electron.remote.getGlobal('CCODES').CCODES;
};

const Load_USER_REPOSITORIES_ = () => {
  try {
    const USER_REPOSITORY_DATA = fs.pathExistsSync(
      USER_REPOSITORY_DATA_FILE_PATH
    )
      ? JSON.parse(
          fs.readFileSync(USER_REPOSITORY_DATA_FILE_PATH, { encoding: 'utf-8' })
        )
      : {};

    return USER_REPOSITORY_DATA;
  } catch (e_) {
    log('Could not Load User_Repositories', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load User_Repositories\n\n${e_}`,
    });
  }
};

const LOAD_SYNC_FILE = () => {
  try {
    const SYNC_DATA = fs.pathExistsSync(SYNC_DATA_FILE_PATH)
      ? JSON.parse(fs.readFileSync(SYNC_DATA_FILE_PATH, { encoding: 'utf-8' }))
      : {};

    return SYNC_DATA;
  } catch (e_) {
    log('Could not Load Sync Data', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load Sync Data\n\n${e_}`,
    });
  }
};

const getScheduler = () => {
  return electron.remote.getGlobal('PyScheduler');
};

export const setSchedulerHandler = (Handler: any) => {
  getScheduler().on('message', (data: any) => Handler(data));
};

export const sendSchedulerTask = (task: any) => {
  getScheduler().send(task);
};

export const Scheduler = getScheduler();

export const APP_SETTINGS = Load_APPSETTINGS();

export const CCODES = Load_CCODES();

export const USER_REPOSITORY_DATA = Load_USER_REPOSITORIES_();

export const SYNC_DATA = LOAD_SYNC_FILE();

export const DEFAULT_REPO_FOLDER_PATH = '.usp';

export const DEFAULT_REPO_DATA_FOLDER_PATH = path.join(
  DEFAULT_REPO_FOLDER_PATH,
  'data'
);
export const DEFAULT_REPO_LOG_FOLDER_PATH = path.join(
  DEFAULT_REPO_FOLDER_PATH,
  'logs'
);
export const DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH = path.join(
  DEFAULT_REPO_FOLDER_PATH,
  'c_storage'
);
export const DEFAULT_REPO_SETTINGS_FILE_PATH = path.join(
  DEFAULT_REPO_FOLDER_PATH,
  'repositorySettings.json'
);
export const DEFAULT_REPO_COMMIT_FILE_PATH = path.join(
  DEFAULT_REPO_FOLDER_PATH,
  'commit.json'
);
