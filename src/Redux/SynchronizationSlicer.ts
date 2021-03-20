/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import log from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import {
  CCODES,
  sendSchedulerTask,
  SYNC_DATA,
  SYNC_DATA_FILE_PATH,
} from '../modules/get_AppData';

export interface SYNC_INPUT {
  fileName: string;
  filePath: string;
  driveID?: string;
  status?: 'WAITING' | 'RUNNING' | 'PAUSED' | 'FAILED' | 'FINISHED';
  parentID?: string;
  progress?: number;
}

export interface addAction_Input {
  payload: {
    RepoID: number;
    data: Array<SYNC_INPUT>;
  };
}

export interface addQueueAction_Input {
  payload: {
    RepoID: number;
    data: Array<SYNC_INPUT>;
  };
}

export interface DoingQueue {
  fileName: string;
  filePath: string;
  driveID?: string;
  progress?: number;
  RepoID: number | string;
  status?: string;
}

export interface FinishedQueue {
  fileName: string;
  driveID: string;
  parentPath: string;
}

export interface WatingQueueInterface {
  [RepoID: string]: Array<SYNC_INPUT>;
}

export interface FinishedQueueInterface {
  [RepoID: string]: Array<FinishedQueue>;
}

export interface RepoDataInerface {
  [RepoID: string]: {
    [folderPath: string]: string | null;
  };
}

export interface SYNC_DATA_STRUCTURE {
  RepoData: RepoDataInerface;

  uploadingQueue: Array<DoingQueue>;

  uploadWatingQueue: WatingQueueInterface;
  uploadFinishedQueue: FinishedQueueInterface;
  downloadingQueue: Array<DoingQueue>;
  downloadWatingQueue: WatingQueueInterface;
  downloadFinishedQueue: FinishedQueueInterface;
  showUploadsDrawer: boolean;
  showDownloadsDrawer: boolean;

  totalSessionUploads: number;
  totalSessionDownloads: number;

  generatedIDs: Array<string>;
}

interface setWatingQueueInterface {
  payload: {
    RepoID: number;
    data: Array<SYNC_INPUT>;
  };
}

interface setRepositoryDataInterface {
  payload: {
    RepoID: number;
    RepoName: string;
    folderData: {
      [folderPath: string]: string | null;
    };
  };
}
interface allocateRepoDataInterface {
  payload: {
    RepoID: number | string;
    folderData: {
      [folderPath: string]: string | null;
    };
  };
}
interface addFinishedQueueInterface {
  payload: {
    fileName: string;
    parentPath: string;
    driveID: string;
    RepoID: number | string;
  };
}

interface ReAddFailedUploadInterface {
  payload: {
    RepoID: string | number;
    fileName: string;
    filePath: string;
    driveID?: string;
  };
}

const GET: () => SYNC_DATA_STRUCTURE = () => {
  const data: SYNC_DATA_STRUCTURE = SYNC_DATA;

  const {
    uploadingQueue,
    uploadWatingQueue,
    downloadingQueue,
    downloadWatingQueue,
    RepoData,
    generatedIDs,
  } = data;

  if (!uploadingQueue) data.uploadingQueue = [];
  if (!downloadingQueue) data.downloadingQueue = [];
  if (!uploadWatingQueue) data.uploadWatingQueue = {};
  if (!downloadWatingQueue) data.downloadWatingQueue = {};
  if (!generatedIDs) data.generatedIDs = [];
  if (!RepoData) data.RepoData = {};

  // FINISHED DOWNLOADS & UPLOADS SHOULD BE RESETTED AFTER EVERY SESSION
  data.uploadFinishedQueue = {};
  data.downloadFinishedQueue = {};

  data.totalSessionUploads = 0;
  data.totalSessionDownloads = 0;

  data.showDownloadsDrawer = false;
  data.showUploadsDrawer = false;

  return { ...SYNC_DATA, ...data };
};

const SAVE = (data: SYNC_DATA_STRUCTURE) =>
  fs
    .writeFile(
      SYNC_DATA_FILE_PATH,
      JSON.stringify(
        {
          ...data,
          showUploadsDrawer: undefined,
          showDownloadsDrawer: undefined,
        },
        null,
        2
      )
    )
    .then(() => log.info('Saved Updated Sync Data'))
    .catch((err) => log.error('Failed to Save Sync Data', err.message));

const MAX_PARALLEL_UPLOAD = 1;
const MAX_PARALLEL_DOWNLOAD = 1;

const showProxy = (o) => JSON.parse(JSON.stringify(o));

export const SynchronizationSlice = createSlice({
  name: 'Synchronization',
  initialState: GET(),
  reducers: {
    saveSyncData: (state) => {
      SAVE(state);
    },
    setRepositoryData: (state, action: setRepositoryDataInterface) => {
      const { RepoID, folderData } = action.payload;
      state.RepoData[RepoID] = folderData;
    },
    setUploadWatingQueue: (state, action: setWatingQueueInterface) => {
      state.uploadWatingQueue[action.payload.RepoID] = action.payload.data;
      state.totalSessionUploads += action.payload.data.length;
    },
    setDownloadWatingQueue: (state, action: setWatingQueueInterface) => {
      state.downloadWatingQueue[action.payload.RepoID] = action.payload.data;
      state.totalSessionDownloads += action.payload.data.length;
    },
    addUploadFinishedQueue: (state, action: addFinishedQueueInterface) => {
      const { RepoID, fileName, driveID, parentPath } = action.payload;
      const filePath = path.join(parentPath, fileName);
      const indexTobeRemoved = state.uploadingQueue.findIndex(
        (val) => val.driveID === driveID || val.filePath === filePath
      );

      if (indexTobeRemoved > -1) {
        state.uploadingQueue.splice(indexTobeRemoved, 1);
      }

      if (!state.uploadFinishedQueue[RepoID])
        state.uploadFinishedQueue[RepoID] = [];

      state.uploadFinishedQueue[RepoID].push({
        fileName,
        driveID,
        parentPath,
      });
    },
    addDownloadFinishedQueue: (state, action: addFinishedQueueInterface) => {
      const { RepoID, fileName, driveID, parentPath } = action.payload;
      const filePath = path.join(parentPath, fileName);

      const indexTobeRemoved = state.downloadingQueue.findIndex(
        (val) => val.driveID === driveID || val.filePath === filePath
      );

      if (indexTobeRemoved > -1) {
        state.downloadingQueue.splice(indexTobeRemoved, 1);
      }

      if (!state.downloadFinishedQueue[RepoID])
        state.downloadFinishedQueue[RepoID] = [];

      state.downloadFinishedQueue[RepoID].push({
        fileName,
        driveID,
        parentPath,
      });
    },
    ReAddFailedUpload: (state, action: ReAddFailedUploadInterface) => {
      const { driveID, RepoID, fileName, filePath } = action.payload;
      let indexTobeRemoved = -1;
      if (driveID) {
        indexTobeRemoved = state.uploadingQueue.findIndex(
          (val) => val.driveID === driveID
        );
      } else {
        indexTobeRemoved = state.uploadingQueue.findIndex(
          (val) => val.filePath === filePath
        );
      }

      if (indexTobeRemoved > -1) {
        state.uploadingQueue.splice(indexTobeRemoved, 1);

        state.uploadWatingQueue[RepoID].push({
          driveID,
          fileName,
          filePath,
        });
      }
    },
    ReAddFailedDownload: (state, action: ReAddFailedUploadInterface) => {
      const { driveID, RepoID, fileName, filePath } = action.payload;
      let indexTobeRemoved = -1;
      if (driveID) {
        indexTobeRemoved = state.downloadingQueue.findIndex(
          (val) => val.driveID === driveID
        );
      } else {
        indexTobeRemoved = state.downloadingQueue.findIndex(
          (val) => val.filePath === filePath
        );
      }

      if (indexTobeRemoved > -1) {
        state.downloadingQueue.splice(indexTobeRemoved, 1);

        state.downloadWatingQueue[RepoID].push({
          driveID,
          fileName,
          filePath,
        });
      }
    },
    updateUploadingQueue: (state) => {
      const { uploadWatingQueue, RepoData } = state;
      Object.keys(uploadWatingQueue).forEach((RepoID) => {
        if (state.uploadingQueue.length < MAX_PARALLEL_UPLOAD) {
          uploadWatingQueue[RepoID].forEach((val, index) => {
            if (state.uploadingQueue.length < MAX_PARALLEL_UPLOAD) {
              const parentPath = path.dirname(val.filePath);
              const parentID = RepoData[RepoID][parentPath];
              if (parentID) {
                // UPDATING WAITING QUEUE , IMP SECTION
                state.uploadWatingQueue[RepoID].splice(index, 1);
                /// //////////////////////////////////////
                const newUploads: DoingQueue = {
                  fileName: val.fileName,
                  filePath: val.filePath,
                  driveID: val.driveID,
                  RepoID,
                  status: 'RUNNING',
                };
                state.uploadingQueue = [...state.uploadingQueue, newUploads];
                sendSchedulerTask({
                  code: CCODES.UPLOAD_FILE,
                  data: {
                    ...newUploads,
                    parentDriveID: state.RepoData[RepoID][parentPath],
                  },
                });
              }
            }
          });
        }
      });
    },
    updateDownloadingQueue: (state) => {
      const { downloadWatingQueue, RepoData } = state;
      Object.keys(downloadWatingQueue).forEach((RepoID) => {
        if (state.downloadingQueue.length < MAX_PARALLEL_DOWNLOAD) {
          const newDownloads: Array<DoingQueue> = downloadWatingQueue[
            RepoID
          ].filter((val, index) => {
            const parentID = RepoData[RepoID][path.dirname(val.filePath)];

            if (parentID) {
              downloadWatingQueue[RepoID].splice(index, 1);
              return true;
            }

            return false;
          })
            .splice(0, MAX_PARALLEL_DOWNLOAD - state.downloadingQueue.length)
            .map((val) => ({
              RepoID,
              fileName: val.fileName,
              filePath: val.filePath,
              driveID: val.driveID,
              status: 'RUNNING',
            }));

          if (newDownloads.length) {
            state.downloadingQueue = [
              ...state.downloadingQueue,
              ...newDownloads,
            ];

            newDownloads.forEach((val) => {
              const parentPath = path.dirname(val.filePath);
              const parentDriveID = state.RepoData[RepoID][parentPath];
              sendSchedulerTask({
                code: CCODES.DOWNLOAD_FILE,
                data: { ...val, parentDriveID },
              });
            });
          }
        }
      });
    },
    showUploadsDrawer: (state) => {
      state.showUploadsDrawer = true;
      state.showDownloadsDrawer = false;
    },
    showDownloadsDrawer: (state) => {
      state.showDownloadsDrawer = true;
      state.showUploadsDrawer = false;
    },
    closeSyncDrawer: (state) => {
      state.showDownloadsDrawer = false;
      state.showUploadsDrawer = false;
    },
    allocateRepoData: (state, action: allocateRepoDataInterface) => {
      const { RepoID, folderData } = action.payload;
      state.RepoData[RepoID] = {
        ...state.RepoData[RepoID],
        ...folderData,
      };
    },
  },
});

export const {
  saveSyncData,
  showDownloadsDrawer,
  showUploadsDrawer,
  closeSyncDrawer,
  setRepositoryData,
  setUploadWatingQueue,
  setDownloadWatingQueue,
  updateUploadingQueue,
  updateDownloadingQueue,
  allocateRepoData,
  addUploadFinishedQueue,
  addDownloadFinishedQueue,
  ReAddFailedUpload,
  ReAddFailedDownload,
} = SynchronizationSlice.actions;

export const SYNC_ACTIONS = SynchronizationSlice.actions;
export default SynchronizationSlice.reducer;
