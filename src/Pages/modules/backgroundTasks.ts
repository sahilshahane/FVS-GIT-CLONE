/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs-extra';
import path from 'path';
import { batch } from 'react-redux';
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
} from './Redux/SynchronizationSlicer';
import showError from './ErrorPopup_dialog';

const { dispatch } = Reduxstore;

const LOAD_UPLOADS_FROM_REPOSITORY = async () => {
  const RepoINFO = Reduxstore.getState().UserRepoData.info;

  RepoINFO.forEach(async (repo) => {
    try {
      const CommitFilePath = path.join(
        repo.localLocation,
        DEFAULT_REPO_COMMIT_FILE_PATH
      );
      const commitFile = await fs.readJson(CommitFilePath);

      const SyncfilePath = path.join(
        repo.localLocation,
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
            RepoID: repo.id,
            folderData,
            RepoName: repo.displayName,
          })
        );

        if (filesToUpload.length)
          dispatch(
            setUploadWatingQueue({
              RepoID: repo.id,
              data: filesToUpload,
            })
          );

        if (filesToDownload.length)
          dispatch(
            setDownloadWatingQueue({
              RepoID: repo.id,
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

const RegisterSyncWroker = async () => {
  Reduxstore.subscribe(async () => {
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
  });
};

// eslint-disable-next-line import/prefer-default-export
export const LOAD_ONCE_AFTER_APP_READY = () => {
  LOAD_UPLOADS_FROM_REPOSITORY();
  RegisterSyncWroker();

  console.log('Background Service Started!');
};
