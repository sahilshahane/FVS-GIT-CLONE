/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import path from 'path';
import { batch } from 'react-redux';
import { remote } from 'electron';
import {
  DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH,
  DEFAULT_REPO_COMMIT_FILE_PATH,
} from './get_AppData';
import Reduxstore from './Redux/store';
import {
  setRepositoryData,
  updateUploadingQueue,
  updateDownloadingQueue,
  setUploadWatingQueue,
  setDownloadWatingQueue,
  saveSyncData,
} from './Redux/SynchronizationSlicer';
import { saveUserRepositoryDataSync } from './Redux/UserRepositorySlicer';
import { saveRepositorySettings } from './Redux/AppSettingsSlicer';
import showError from './ErrorPopup_dialog';
import {
  APP_SETTINGS_FILE_PATH,
  SYNC_DATA_FILE_PATH,
  USER_REPOSITORY_DATA_FILE_PATH,
} from './get_AppData';
const { dispatch } = Reduxstore;

const LOAD_UPLOADS_FROM_REPOSITORY = async () => {
  const RepoINFO = Reduxstore.getState().UserRepoData.info;

  Object.keys(RepoINFO).forEach(async (RepoID) => {
    try {
      const CommitFilePath = path.join(
        RepoINFO[RepoID].localLocation,
        DEFAULT_REPO_COMMIT_FILE_PATH
      );
      const commitFile = await fs.readJson(CommitFilePath);

      const SyncfilePath = path.join(
        RepoINFO[RepoID].localLocation,
        DEFAULT_REPO_CLOUD_STORAGE_FOLDER_PATH,
        commitFile.latest.fileName
      );

      const SyncData = await fs.readJson(SyncfilePath);

      // const RepositoryFolderID = SyncData[repo.localLocation].id;

      const filesToUpload: Array<any> = [];
      const filesToDownload: Array<any> = [];
      const folderData: Array<any> = [];

      Object.keys(SyncData).map((folderPath) => {
        folderData.push({
          folderPath,
          driveID: SyncData[folderPath].id,
          isCreated: SyncData[folderPath].isCreated,
        });

        SyncData[folderPath].files.forEach((fileData: any) => {
          const filePath = path.join(folderPath, fileData.name);

          if (!fileData.isUploaded) {
            filesToUpload.push({ filePath, fileName: fileData.name });
          } else if (fileData.isUploaded && !fileData.isDownloaded) {
            filesToDownload.push({ filePath, fileName: fileData.name });
          }
        });

        return null;
      });

      batch(() => {
        dispatch(
          setRepositoryData({
            RepoID: Number(RepoID),
            folderData,
            RepoName: RepoINFO[RepoID].displayName,
          })
        );

        if (filesToUpload.length)
          dispatch(
            setUploadWatingQueue({
              RepoID: Number(RepoID),
              data: filesToUpload,
            })
          );

        if (filesToDownload.length)
          dispatch(
            setDownloadWatingQueue({
              RepoID: Number(RepoID),
              data: filesToDownload,
            })
          );
      });
    } catch (err) {
      showError(
        'Repository Error',
        `Something Went Wrong While Loading ${repo.displayName} Repository`
      );
    }
  });
};

let uploadServiceTimeoutID: NodeJS.Timeout | any = null;
let downloadServiceTimeoutID: NodeJS.Timeout | any = null;

const MAX_PARALLEL_UPLOAD = 4;
const MAX_PARALLEL_DOWNLOAD = 4;

const SYNC_CHECK_TIMEOUT = 2000; // values in ms

export const updateSync = async () => {
  try {
    const {
      uploadingQueue,
      downloadingQueue,
      uploadWatingQueue,
      downloadWatingQueue,
    } = Reduxstore.getState().Sync;

    const uploadWaitingList = Object.keys(uploadWatingQueue);
    const downloadWaitingList = Object.keys(downloadWatingQueue);

    if (
      uploadingQueue.length < MAX_PARALLEL_UPLOAD &&
      uploadWaitingList.length
    ) {
      if (uploadServiceTimeoutID) clearTimeout(uploadServiceTimeoutID);

      uploadServiceTimeoutID = setTimeout(
        () => Reduxstore.dispatch(updateUploadingQueue()),
        SYNC_CHECK_TIMEOUT
      );
    }

    if (
      downloadingQueue.length < MAX_PARALLEL_DOWNLOAD &&
      downloadWaitingList.length
    ) {
      if (downloadServiceTimeoutID) clearTimeout(downloadServiceTimeoutID);

      downloadServiceTimeoutID = setTimeout(
        () => Reduxstore.dispatch(updateDownloadingQueue()),
        SYNC_CHECK_TIMEOUT
      );
    }
  } catch (Err) {
    showError(
      'Sync Worker Error',
      `Something Went Wrong While Running Sync Service Worker`
    );
  }
};

const RegisterSyncWroker = async () => {
  Reduxstore.subscribe(updateSync);
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  LOAD_UPLOADS_FROM_REPOSITORY();
  RegisterSyncWroker();

  console.log('Background Service Started!');
};

remote.getCurrentWindow().on('close', () => {
  // dispatch(saveSyncData());
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();

  fs.writeJsonSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJsonSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  // fs.writeJsonSync(SYNC_DATA_FILE_PATH, Sync);
});
