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
  SyncFile,
  SYNC_DATA_STRUCTURE,
} from './Redux/SynchronizationSlicer';

import showError, { ShowInfo } from './ErrorPopup_dialog';
import { USER_REPOSITORY_DATA_STRUCTURE } from './Redux/UserRepositorySlicer';

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

      const SyncData: SyncFile = await fs.readJson(SyncfilePath);

      const filesToUpload: Array<SYNC_INPUT> = [];
      const filesToDownload: Array<SYNC_INPUT> = [];
      const folderData: {
        [folderPath: string]: string | undefined | null;
      } = {};

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
let downloadServiceTimeoutID: NodeJS.Timeout | any = null;

const SYNC_CHECK_TIMEOUT = 100; // values in ms

export const updateUploads = () => {
  clearTimeout(uploadServiceTimeoutID);
  // console.log('Updating...');
  uploadServiceTimeoutID = setTimeout(
    () => Reduxstore.dispatch(updateUploadingQueue()),
    SYNC_CHECK_TIMEOUT
  );
};

export const updateDownloads = () => {
  clearTimeout(downloadServiceTimeoutID);

  downloadServiceTimeoutID = setTimeout(
    () => Reduxstore.dispatch(updateDownloadingQueue()),
    SYNC_CHECK_TIMEOUT
  );
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  LOAD_UPLOADS_FROM_REPOSITORY();

  console.log('Background Service Started!');
};

// remote.app.on('before-quit', (e) => {
//   e.preventDefault();
// });

const SAVE_SYNC_UPDATES_TO_REPOSITORIES = (
  UserRepoData: USER_REPOSITORY_DATA_STRUCTURE,
  Sync: SYNC_DATA_STRUCTURE
) => {
  Object.keys(Sync.RepoData).forEach((RepoID) => {
    try {
      const CommitFilePath = path.join(
        UserRepoData.info[RepoID].localLocation,
        DEFAULT_REPO_COMMIT_FILE_PATH
      );
      const commitFile = fs.readJsonSync(CommitFilePath);

      const SyncfilePath = path.join(
        UserRepoData.info[RepoID].localLocation,
        DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH,
        commitFile.latest.fileName
      );
      const data: SyncFile = fs.readJsonSync(SyncfilePath);

      Object.keys(Sync.RepoData[RepoID]).forEach((folderPath) => {
        if (!data[folderPath]) data[folderPath] = { files: [] };
      });

      const DataToUpdate: {
        [folderPath: string]: {
          [fileName: string]: {
            driveID: string;
            isUploaded?: boolean;
            isDownloaded?: boolean;
          };
        };
      } = {};

      if (Sync.uploadFinishedQueue[RepoID])
        // FOR FINISHED UPLOADS
        Sync.uploadFinishedQueue[RepoID].forEach((fileData) => {
          if (!DataToUpdate[fileData.parentPath])
            DataToUpdate[fileData.parentPath] = {};

          DataToUpdate[fileData.parentPath][fileData.fileName] = {
            driveID: fileData.driveID,
            isUploaded: true,
          };
        });

      if (Sync.downloadFinishedQueue[RepoID])
        // FOR FINISHED DOWNLOADS
        Sync.downloadFinishedQueue[RepoID].forEach((fileData) => {
          if (!DataToUpdate[fileData.parentPath])
            DataToUpdate[fileData.parentPath] = {};

          if (!DataToUpdate[fileData.parentPath][fileData.fileName])
            DataToUpdate[fileData.parentPath][fileData.fileName] = {
              driveID: fileData.driveID,
              isDownloaded: true,
            };
          else
            DataToUpdate[fileData.parentPath][
              fileData.fileName
            ].isDownloaded = true;
        });

      Object.keys(DataToUpdate).forEach((folderPath) => {
        data[folderPath].files = data[folderPath].files.filter((val) => {
          if (DataToUpdate[folderPath][val.fileName]) {
            if (DataToUpdate[folderPath][val.fileName].isDownloaded === false)
              DataToUpdate[folderPath][val.fileName].isDownloaded = undefined;
            else DataToUpdate[folderPath][val.fileName].isDownloaded = true;

            if (DataToUpdate[folderPath][val.fileName].isUploaded === false)
              DataToUpdate[folderPath][val.fileName].isUploaded = undefined;
            else DataToUpdate[folderPath][val.fileName].isUploaded = true;
            return false;
          }
          return true;
        });
        Object.keys(DataToUpdate[folderPath]).forEach((fileName) => {
          data[folderPath].files.push({
            ...DataToUpdate[folderPath][fileName],
            fileName,
          });
        });
      });
      fs.writeJsonSync(SyncfilePath, data);
    } catch (err) {
      showError(
        'Failed To Save Sync Status...',
        `Repository Name : ${UserRepoData.info[RepoID].displayName}  Repository ID : ${RepoID}  Reason : ${err}`
      );
    }
  });
};

remote.getCurrentWindow().on('close', (e) => {
  e.preventDefault();
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();
  SAVE_SYNC_UPDATES_TO_REPOSITORIES(UserRepoData, Sync);
  fs.writeJSONSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJSONSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  remote.getCurrentWindow().removeAllListeners('close');
  remote.getCurrentWindow().close();
});
