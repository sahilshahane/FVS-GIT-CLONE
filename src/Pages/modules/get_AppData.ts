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
export const APP_HOME_PATH = Load_APP_HOME_PATH(); // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const Load_APPSETTINGS = () => {
  try {
    const APP_SETTINGS_FILE_PATH = path.join(APP_HOME_PATH, 'Appsetting.json');

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return {
      APP_SETTINGS: JSON.parse(
        fs.readFileSync(APP_SETTINGS_FILE_PATH).toString()
      ),
      APP_SETTINGS_FILE_PATH,
    };
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
    const USER_REPOSITORY_DATA_FILE_PATH = path.join(
      APP_HOME_PATH,
      'folder-metadata',
      'info.json'
    );
    const USER_REPOSITORY_DATA = JSON.parse(
      fs.readFileSync(USER_REPOSITORY_DATA_FILE_PATH).toString()
    );

    // Normalize localLocation Path
    USER_REPOSITORY_DATA.info = USER_REPOSITORY_DATA.info.map(
      (Repository: any) => {
        Repository.localLocation = path.normalize(Repository.localLocation);
        return Repository;
      }
    );

    return {
      USER_REPOSITORY_DATA,
      USER_REPOSITORY_DATA_FILE_PATH,
    };
  } catch (e_) {
    log('Could not Load User_Repositories', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load User_Repositories\n\n${e_}`,
    });
  }

  return {
    USER_REPOSITORY_DATA: '',
    USER_REPOSITORY_DATA_FILE_PATH: '',
  };
};

const LOAD_SYNC_FILE = () => {
  try {
    const SYNC_DATA_FILE_PATH = path.join(APP_HOME_PATH, 'Sync.json');
    const SYNC_DATA = JSON.parse(
      fs.readFileSync(SYNC_DATA_FILE_PATH, { encoding: 'utf-8' })
    );
    return {
      SYNC_DATA,
      SYNC_DATA_FILE_PATH,
    };
  } catch (e_) {
    log('Could not Load Sync Data', e_.message);
    ipcRenderer.sendSync('quit', {
      message: `Could not Load Sync Data\n\n${e_}`,
    });
  }
  return {
    SYNC_DATA: '',
    SYNC_DATA_FILE_PATH: '',
  };
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

export const { APP_SETTINGS, APP_SETTINGS_FILE_PATH } = Load_APPSETTINGS();
export const CCODES = Load_CCODES();
export const {
  USER_REPOSITORY_DATA,
  USER_REPOSITORY_DATA_FILE_PATH,
} = Load_USER_REPOSITORIES_();
export const { SYNC_DATA, SYNC_DATA_FILE_PATH } = LOAD_SYNC_FILE();
