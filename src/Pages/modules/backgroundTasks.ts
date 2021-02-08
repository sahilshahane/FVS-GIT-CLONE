/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import path from 'path';
import { batch } from 'react-redux';
import { remote } from 'electron';
import {
  DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH,
  DEFAULT_REPO_COMMIT_FILE_PATH,
  APP_SETTINGS_FILE_PATH,
  SYNC_DATA_FILE_PATH,
  USER_REPOSITORY_DATA_FILE_PATH,
  sendSchedulerTask,
  CCODES,
} from './get_AppData';
import Reduxstore from './Redux/store';
import {
  setRepositoryData,
  updateUploadingQueue,
  updateDownloadingQueue,
  setUploadWatingQueue,
  setDownloadWatingQueue,
  SYNC_INPUT,
} from './Redux/SynchronizationSlicer';

import showError, { ShowInfo } from './ErrorPopup_dialog';

const RepoSyncTaskTimeouts: { [RepoID: string]: any } = {};
const RepoSyncTaskTimeoutsRate = 1000;

export const createRepoFolders = (
  RepoID: string | number,
  TimeoutMs = RepoSyncTaskTimeoutsRate
) => {
  clearTimeout(RepoSyncTaskTimeouts[RepoID]);

  RepoSyncTaskTimeouts[RepoID] = setTimeout(() => {
    const { Sync, UserRepoData } = Reduxstore.getState();
    const { RepoData } = Sync;

    sendSchedulerTask({
      code: CCODES.CREATE_FOLDERS,
      data: {
        RepoID,
        RepoName: UserRepoData.info[RepoID].displayName,
        folderPath: UserRepoData.info[RepoID].localLocation,
        folderData: RepoData[RepoID],
      },
    });
  }, TimeoutMs);
};

export const LOAD_UPLOADS_FROM_REPOSITORY = async () => {
  const { UserRepoData, Sync } = Reduxstore.getState();

  const ReposToLoad: Array<number> = Object.keys(UserRepoData.info).reduce(
    (prev: any, RepoID) => {
      if (!Sync.RepoData[RepoID]) return [...prev, RepoID];

      return prev;
    },
    []
  );

  ReposToLoad.forEach(async (RepoID) => {
    try {
      const CommitFilePath = path.join(
        UserRepoData.info[RepoID].localLocation,
        DEFAULT_REPO_COMMIT_FILE_PATH
      );
      const commitFile = await fs.readJson(CommitFilePath);

      const SyncfilePath = path.join(
        UserRepoData.info[RepoID].localLocation,
        DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH,
        commitFile.latest.fileName
      );

      const SyncData = await fs.readJson(SyncfilePath);

      const filesToUpload: Array<SYNC_INPUT> = [];
      const filesToDownload: Array<SYNC_INPUT> = [];
      const folderData: { [folderPath: string]: string | null } = {};

      Object.keys(SyncData).map((folderPath) => {
        if (!SyncData[folderPath].driveID) folderData[folderPath] = null;
        else folderData[folderPath] = SyncData[folderPath].driveID;

        SyncData[folderPath].files.forEach((fileData: any) => {
          const filePath = path.join(folderPath, fileData.fileName);

          if (!fileData.isUploaded) {
            filesToUpload.push({ ...fileData, filePath });
          } else if (fileData.isUploaded && !fileData.isDownloaded) {
            filesToDownload.push({ ...fileData, filePath });
          }
        });

        return null;
      });

      // ShowInfo('', JSON.stringify(folderData, null, 2));
      batch(() => {
        Reduxstore.dispatch(
          setRepositoryData({
            RepoID: Number(RepoID),
            folderData,
            RepoName: UserRepoData.info[RepoID].displayName,
          })
        );

        if (filesToUpload.length)
          Reduxstore.dispatch(
            setUploadWatingQueue({
              RepoID: Number(RepoID),
              data: filesToUpload,
            })
          );

        if (filesToDownload.length)
          Reduxstore.dispatch(
            setDownloadWatingQueue({
              RepoID: Number(RepoID),
              data: filesToDownload,
            })
          );
      });

      createRepoFolders(RepoID);
    } catch (err) {
      showError('Repository Error', String(err));
    }
  });
};

let uploadServiceTimeoutID: NodeJS.Timeout | any = null;

const SYNC_CHECK_TIMEOUT = 100; // values in ms

export const updateSync = () => {
  clearTimeout(uploadServiceTimeoutID);

  uploadServiceTimeoutID = setTimeout(
    () => Reduxstore.dispatch(updateUploadingQueue()),
    SYNC_CHECK_TIMEOUT
  );
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  LOAD_UPLOADS_FROM_REPOSITORY();

  console.log('Background Service Started!');
};

remote.getCurrentWindow().on('close', () => {
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();

  fs.writeJsonSync(APP_SETTINGS_FILE_PATH, AppSettings);
  // fs.writeJsonSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  // fs.writeJsonSync(SYNC_DATA_FILE_PATH, Sync);
});
