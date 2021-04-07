/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {
  APP_SETTINGS_FILE_PATH,
  USER_REPOSITORY_DATA_FILE_PATH,
} from './get_AppData';
import Reduxstore from '../Redux/store';
import { checkGDriveChanges, createRepoFoldersInDrive } from './GoogleDrive';
import { ConnectAllDatabases } from './Database';

export const PerformInitialTask = () => {
  const { UserRepoData } = Reduxstore.getState();

  Object.keys(UserRepoData.info).forEach((RepoID) => {
    const { displayName, trackingInfo } = UserRepoData.info[RepoID];
    // CREATE FOLDERS IN DRIVE FOR FIRST TIME
    if (!trackingInfo) createRepoFoldersInDrive(RepoID, displayName);
    // ELSE CHECK CHANGES IN GOOGLE DRIVE
    else checkGDriveChanges(RepoID, trackingInfo);
  });
};

export const getRepositoryTrackingInfo = (RepoID: string) => {
  const { UserRepoData } = Reduxstore.getState();

  const { trackingInfo } = UserRepoData.info[RepoID];

  return trackingInfo;
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  ConnectAllDatabases();
  PerformInitialTask();
  log.info('Background Service Started!');
};

ipcRenderer.on('save-on-exit', () => {
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();
  log.info('Saving on Exit....');
  fs.writeJSONSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJSONSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  ipcRenderer.send('exit-normal');
});
