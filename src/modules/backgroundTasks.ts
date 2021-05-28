/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {
  APP_SETTINGS_FILE_PATH,
  CCODES,
  sendSchedulerTask,
  USER_REPOSITORY_DATA_FILE_PATH,
} from './get_AppData';
import Reduxstore from '../Redux/store';
import { createRepoFoldersInDrive } from './GoogleDrive';
import { InitializeDatabase } from './Database';
import { trackingInfo_ } from '../Redux/UserRepositorySlicer';
import { checkLocalChanges } from './changes';
import ShowError from './ErrorPopup_dialog';

const TAG = 'backgroundTasks.ts > ';

export const PerformInitialTask = () => {
  const { UserRepoData } = Reduxstore.getState();

  // eslint-disable-next-line consistent-return
  Object.keys(UserRepoData.info).forEach((RepoID) => {
    const { displayName, trackingInfo } = UserRepoData.info[RepoID];

    try {
      // CREATE DATABASE CONNECTION
      InitializeDatabase(RepoID);
    } catch {
      ShowError(
        `Failed to connect ${displayName}`,
        'Please make sure no one is connected to the database or make sure the database exists'
      );
      return null;
    }

    // CREATE FOLDERS IN DRIVE FOR FIRST TIME
    if (!trackingInfo) createRepoFoldersInDrive(RepoID, displayName);
    // ELSE CHECK CHANGES IN GOOGLE DRIVE
    else checkLocalChanges(RepoID, UserRepoData.info[RepoID]);
  });
};

export const getRepositoryTrackingInfo = (RepoID: string) => {
  const { UserRepoData } = Reduxstore.getState();

  const { trackingInfo } = UserRepoData.info[RepoID];

  return trackingInfo;
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  PerformInitialTask();
  log.info('Background Service Started!');
};

ipcRenderer.on('save-on-exit', () => {
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();
  log.info(TAG, 'Saving on Exit....');
  fs.writeJSONSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJSONSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  ipcRenderer.send('exit-normal');
});
