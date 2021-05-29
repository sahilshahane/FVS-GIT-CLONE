/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import log from 'electron-log';
import fs from 'fs-extra';
import {
  getRemainingDownloads,
  getRemainingUploads,
} from '../modules/Database';
import {
  CCODES,
  sendSchedulerTask,
  SYNC_DATA,
  SYNC_DATA_FILE_PATH,
} from '../modules/get_AppData';
import { USER_REPOSITORY_DATA_STRUCTURE } from './UserRepositorySlicer';

const TAG = 'SynchronizationSlicer.ts';

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
    RepoID: string;
    data: Array<SYNC_INPUT>;
  };
}

export interface DoingQueue {
  fileName: string;
  filePath: string;
  driveID?: string;
  progress?: number;
  RepoID: string;
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
  uploadFinishedQueue: FinishedQueueInterface;

  downloadingQueue: Array<DoingQueue>;
  downloadFinishedQueue: FinishedQueueInterface;

  showUploadsDrawer: boolean;
  showDownloadsDrawer: boolean;

  totalSessionUploads: number;
  totalSessionDownloads: number;

  generatedIDs: Array<string>;
}

interface addFinishedQueueInterface {
  payload: {
    fileName: string;
    filePath: string;
    driveID: string;
    RepoID: number | string;
  };
}

const GET: () => SYNC_DATA_STRUCTURE = () => {
  const data: SYNC_DATA_STRUCTURE = SYNC_DATA;

  const { uploadingQueue, downloadingQueue, RepoData, generatedIDs } = data;

  if (!uploadingQueue) data.uploadingQueue = [];
  if (!downloadingQueue) data.downloadingQueue = [];
  // if (!uploadWatingQueue) data.uploadWatingQueue = {};
  // if (!downloadWatingQueue) data.downloadWatingQueue = {};
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

const showProxy = (o: ProxyConstructor) => JSON.parse(JSON.stringify(o));

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
      const { RepoID, fileName, driveID, filePath } = action.payload;

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
        filePath,
      });
    },
    updateUploadingQueue: (
      state,
      action: { payload: USER_REPOSITORY_DATA_STRUCTURE }
    ) => {
      const UserRepoData = action.payload;
      // eslint-disable-next-line consistent-return
      Object.keys(UserRepoData.info).forEach((RepoID) => {
        // CALCULATE HOW MANY UPLOADS DO YOU NEED
        const remainingSlots =
          MAX_PARALLEL_UPLOAD - state.uploadingQueue.length;

        if (remainingSlots) {
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
    updateDownloadingQueue: (
      state,
      action: { payload: USER_REPOSITORY_DATA_STRUCTURE }
    ) => {
      const UserRepoData = action.payload;
      // eslint-disable-next-line consistent-return
      Object.keys(UserRepoData.info).forEach((RepoID) => {
        // CALCULATE HOW MANY UPLOADS DO YOU NEED
        const remainingSlots =
          MAX_PARALLEL_DOWNLOAD - state.downloadingQueue.length;

        if (remainingSlots) {
          // GET THE UPLOADS FROM DATABASE
          const newDownloads = getRemainingDownloads(RepoID, remainingSlots);

          // UPDATE IT FOR UI and STATUS
          state.downloadingQueue = [...state.downloadingQueue, ...newDownloads];

          // SEND TASK TO SCHEDULER
          newDownloads.forEach((fileDownloadData) => {
            if (fileDownloadData.parentDriveID)
              sendSchedulerTask({
                code: CCODES.DOWNLOAD_FILE,
                data: { ...fileDownloadData, RepoID },
              });
            else log.warn('CREATE FOLDERS IN DRIVE FIRST!');
          });
        }
      });
    },
    removeRepositorySyncData: (
      state,
      { payload: RepoID }: { payload: string }
    ) => {
      state.uploadingQueue = state.uploadingQueue.filter(
        (val) => val.RepoID !== RepoID
      );
      if (state.uploadFinishedQueue[RepoID])
        delete state.uploadFinishedQueue[RepoID];

      state.downloadingQueue = state.downloadingQueue.filter(
        (val) => val.RepoID !== RepoID
      );
      if (state.downloadFinishedQueue[RepoID])
        delete state.downloadFinishedQueue[RepoID];

      log.warn(TAG, 'Removed Repository Sync Data');
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
  removeRepositorySyncData,
} = SynchronizationSlice.actions;

export const SYNC_ACTIONS = SynchronizationSlice.actions;
export default SynchronizationSlice.reducer;
