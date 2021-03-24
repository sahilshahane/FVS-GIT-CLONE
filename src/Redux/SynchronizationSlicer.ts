/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import log from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import { getRemainingUploads } from '../modules/Database';
import {
  CCODES,
  sendSchedulerTask,
  SYNC_DATA,
  SYNC_DATA_FILE_PATH,
} from '../modules/get_AppData';
import Reduxstore from '../Redux/store';
import { USER_REPOSITORY_DATA_STRUCTURE } from './UserRepositorySlicer';

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
  parentDriveID: string;
}

export interface FinishedQueue {
  fileName: string;
  driveID: string;
  filePath: string;
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
    filePath: string;
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
    addUploadFinishedQueue: (state, action: addFinishedQueueInterface) => {
      const { RepoID, fileName, driveID, filePath } = action.payload;

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
        filePath,
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

    updateUploadingQueue: (
      state,
      action: { payload: USER_REPOSITORY_DATA_STRUCTURE }
    ) => {
      const UserRepoData = action.payload;
      // eslint-disable-next-line consistent-return
      Object.keys(UserRepoData.info).forEach((RepoID) => {
        if (state.uploadingQueue.length <= MAX_PARALLEL_UPLOAD) {
          // CALCULATE HOW MANY UPLOADS DO YOU NEED
          const remainingSlots =
            MAX_PARALLEL_UPLOAD - state.uploadingQueue.length;

          if (remainingSlots === 0) return null;

          // GET THE UPLOADS FROM DATABASE
          const newUploads = getRemainingUploads(RepoID, remainingSlots);

          // UPDATE IT FOR UI and STATUS
          state.uploadingQueue = [...state.uploadingQueue, ...newUploads];

          // SEND TASK TO SCHEDULER
          newUploads.forEach((fileUploadData) => {
            if (fileUploadData.parentDriveID)
              sendSchedulerTask({
                code: CCODES.UPLOAD_FILE,
                data: { ...fileUploadData, RepoID },
              });
            else log.warn('CREATE FOLDERS IN DRIVE FIRST!');
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
  },
});

export const {
  saveSyncData,
  showDownloadsDrawer,
  showUploadsDrawer,
  closeSyncDrawer,
  updateUploadingQueue,
  updateDownloadingQueue,
  addUploadFinishedQueue,
  addDownloadFinishedQueue,
} = SynchronizationSlice.actions;

export const SYNC_ACTIONS = SynchronizationSlice.actions;
export default SynchronizationSlice.reducer;
