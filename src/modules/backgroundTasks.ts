/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {
  APP_SETTINGS_FILE_PATH,
  USER_REPOSITORY_DATA_FILE_PATH,
  sendSchedulerTask,
  CCODES,
} from './get_AppData';
import Reduxstore from '../Redux/store';

import { getNonCreatedFolder } from './Database';
import path from 'path';

export const createRepoFoldersInDrive = (RepoID: string, RepoName: string) => {
  const folderData = getNonCreatedFolder(RepoID);
  log.info('Creating Folders in Drive', { RepoID, folderData });
  folderData.repoFolderData.RepoName = RepoName;

  // SEND DATA TO SCHEDULER
  sendSchedulerTask({
    code: CCODES.CREATE_FOLDERS,
    data: {
      RepoID,
      ...folderData,
    },
  });
};

export const checkRepoFolders = () => {
  const { UserRepoData } = Reduxstore.getState();

  Object.keys(UserRepoData.info).forEach((RepoID) => {
    const RepoName = UserRepoData.info[RepoID].displayName;

    // CREATE FOLDERS IN DRIVE
    createRepoFoldersInDrive(RepoID, RepoName);
  });
};

export const getRepositoryTrackingInfo = (RepoID: string) => {
  const { UserRepoData } = Reduxstore.getState();

  const { trackingInfo } = UserRepoData.info[RepoID];

  return trackingInfo;
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  checkRepoFolders();
  console.log('Background Service Started!');
};

ipcRenderer.on('save-on-exit', () => {
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();
  log.info('Saving on Exit....');
  fs.writeJSONSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJSONSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  ipcRenderer.send('exit-normal');
});
