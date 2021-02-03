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
} from './Redux/SynchronizationSlicer';

import showError from './ErrorPopup_dialog';

const RepoSyncTaskTimeouts: { [RepoID: string]: any } = {};
const RepoSyncTaskTimeoutsRate = 1000;

export const assignGIDs = (
  RepoID: string | number,
  TimeoutMs = RepoSyncTaskTimeoutsRate
) => {
  const { uploadWatingQueue, RepoData } = Reduxstore.getState().Sync;

  if (uploadWatingQueue[RepoID] && uploadWatingQueue[RepoID].length) {
    clearTimeout(RepoSyncTaskTimeouts[RepoID]);

    let IDs_TO_GENERATE = 0;

    RepoData[RepoID].folderData.forEach(({ driveID }) => {
      if (!driveID) IDs_TO_GENERATE += 1;
    });

    uploadWatingQueue[RepoID].forEach((val) => {
      if (!val.driveID) IDs_TO_GENERATE += 1;
    });

    if (IDs_TO_GENERATE)
      RepoSyncTaskTimeouts[RepoID] = setTimeout(() => {
        sendSchedulerTask({
          code: CCODES.GENERATE_IDS,
          data: { count: IDs_TO_GENERATE, RepoID },
        });
      }, TimeoutMs);
  }
};

export const LOAD_UPLOADS_FROM_REPOSITORY = async () => {
  const { UserRepoData, Sync } = Reduxstore.getState();

  const ReposToLoad = Object.keys(UserRepoData.info).reduce((prev, RepoID) => {
    if (!Sync.RepoData[RepoID]) return [...prev, RepoID];

    return prev;
  }, []);

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

      assignGIDs(RepoID);
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

    const uploadWaitingListLenght = Object.keys(uploadWatingQueue).length;
    const downloadWaitingListLenght = Object.keys(downloadWatingQueue).length;

    if (
      uploadingQueue.length < MAX_PARALLEL_UPLOAD &&
      uploadWaitingListLenght
    ) {
      clearTimeout(uploadServiceTimeoutID);

      uploadServiceTimeoutID = setTimeout(
        () => Reduxstore.dispatch(updateUploadingQueue()),
        SYNC_CHECK_TIMEOUT
      );
    }

    if (
      downloadingQueue.length < MAX_PARALLEL_DOWNLOAD &&
      downloadWaitingListLenght
    ) {
      clearTimeout(downloadServiceTimeoutID);

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
  const { AppSettings, UserRepoData, Sync } = Reduxstore.getState();

  fs.writeJsonSync(APP_SETTINGS_FILE_PATH, AppSettings);
  fs.writeJsonSync(USER_REPOSITORY_DATA_FILE_PATH, UserRepoData);
  fs.writeJsonSync(SYNC_DATA_FILE_PATH, Sync);
});
