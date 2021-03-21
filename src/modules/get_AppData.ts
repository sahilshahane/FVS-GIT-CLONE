/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { ipcRenderer } from 'electron';
import path from 'path';
import fs from 'fs-extra';

const Load_APP_HOME_PATH = () => {
  return ipcRenderer.sendSync('get-APP_HOME_PATH');
};

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

const Load_APPSETTINGS = () => {
  try {
    return JSON.parse(fs.readFileSync(APP_SETTINGS_FILE_PATH).toString());
  } catch (e_) {
    ipcRenderer.sendSync('quit', {
      message: `Could not Load App Settings\n\n${e_}`,
    });
  }
  return { APP_SETTINGS: '', APP_SETTINGS_FILE_PATH: '' };
};

const Load_CCODES = () => {
  return ipcRenderer.sendSync('get-CCODES').CCODES;
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
    ipcRenderer.sendSync('quit', {
      message: `Could not Load Sync Data\n\n${e_}`,
    });
  }
};

interface CCODES_ {
  ERROR: -1;
  FOLDER_CREATED: 1;
  FOLDER_DELETED: 2;
  FOLDER_EXISTS: 3;
  FILE_CREATED: 4;
  FILE_DELETED: 5;
  FILE_MODIFIED: 6;
  FILE_DATA_CREATED: 7;
  COMMIT_DONE: 8;
  LOG_CREATED: 9;
  PRE_INIT_DONE: 10;
  INIT_DONE: 11;
  REPO_SETTINGS_LOADED: 12;
  IGNORE_DATA_LOADED: 13;
  NO_CHANGE: 14;
  NEW_FILE_DETECTED: 15;
  MODIFIED_FILE_DETECTED: 16;
  DELETED_FILE_DETECTED: 17;
  CHANGE_DETECTED: 18;
  GOOGLE_LOGIN_STARTED: 19;
  GOOGLE_LOGIN_FAILED: 20;
  GOOGLE_LOGIN_SUCCESS: 21;
  GOOGLE_LOGIN_URL: 22;
  GOOGLE_ID_NOT_FOUND: 23;
  INTERNET_CONNECTION_ERROR: 24;
  GOOGLE_SERVICE_OBJECT: 25;
  OPEN_BROWSER: 26;
  LOCAL_SERVER_STARTED: 27;
  LOCAL_SERVER_CLOSED: 28;
  PRE_INIT_REPOSITORY: 29;
  GOOGLE_USER_INFO: 30;
  GOOGLE_ID_FOUND: 31;
  PYTHON_SERVER_STARTED: 32;
  TASK_FAILED: 33;
  START_GOOGLE_LOGIN: 34;
  INIT_DIR: 35;
  REPO_EXISTS: 36;
  UPLOAD_FILE: 37;
  UPLOADING_FILE: 38;
  RESET_UPLOADING_FILES: 39;
  FILE_UPLOADED: 40;
  ALL_FILES_UPLOADED: 41;
  FILES_NOT_UPLOADED: 42;
  PAUSE_UPLOAD: 43;
  UPLOAD_REMANING: 44;
  CREATE_FOLDER: 45;
  GENERATE_IDS: 46;
  DOWNLOAD_FILE: 47;
  ADD_UPLOAD: 48;
  ADD_DOWNLOAD: 49;
  UPLOAD_REPOSITORY: 50;
  UPLOAD_STARTED: 51;
  UPLOAD_PROGRESS: 52;
  UPLOAD_SUCCESS: 53;
  UPLOAD_FAILED: 54;
  IDS_GENERATED: 55;
  RETRIVE_REPO_UPLOADS: 56;
  GENERATE_IDS_FAILED: 58;
  CREATE_FOLDERS: 59;
}

export const sendSchedulerTask = (task: { code: number; data?: any }) => {
  ipcRenderer.send('scheduler-task', task);
};

export const APP_SETTINGS = Load_APPSETTINGS();

export const CCODES: CCODES_ = Load_CCODES();

export const USER_REPOSITORY_DATA = Load_USER_REPOSITORIES_();

export const SYNC_DATA = LOAD_SYNC_FILE();

export const DEFAULT_REPO_FOLDER_PATH = '.usp';
