/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs-extra';
import { SYNC_DATA, SYNC_DATA_FILE_PATH } from '../get_AppData';
import log from '../log';

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
  type?: any;
}

export interface addQueueAction_Input {
  payload: {
    RepoID: number;
    data: Array<SYNC_INPUT>;
  };
  type?: any;
}

export interface SYNC_DATA_STRUCTURE {
  RepoData: {
    [RepoID: string]: {
      RepoName: string;
      folderData: Array<{
        folderPath: string | null;
        isCreated?: boolean;
        driveID?: string;
      }>;
      driveID?: string;
      areFoldersAllocated: boolean;
    };
  };

  uploadingQueue: Array<SYNC_INPUT>;

  uploadWatingQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  uploadFinishedQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  downloadingQueue: Array<SYNC_INPUT>;
  downloadWatingQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  downloadFinishedQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  showUploadsDrawer: boolean;
  showDownloadsDrawer: boolean;

  totalSessionUploads: number;
  totalSessionDownloads: number;
}

interface setWatingQueueInterface {
  payload: {
    RepoID: number;
    data: [{ filePath: string; fileName: string }];
  };
}

interface setRepositoryDataInterface {
  payload: {
    RepoID: number;
    RepoName: string;
    folderData: Array<{
      folderPath: string | null;
      isCreated?: boolean;
    }>;
    driveID?: string;
  };
  type?: any;
}

const GET: () => SYNC_DATA_STRUCTURE = () => {
  const data: SYNC_DATA_STRUCTURE = {};

  const {
    uploadingQueue,
    uploadWatingQueue,
    downloadingQueue,
    downloadWatingQueue,
    RepoData,
  } = SYNC_DATA;

  if (!uploadingQueue) data.uploadingQueue = [];
  if (!downloadingQueue) data.downloadingQueue = [];
  if (!uploadWatingQueue) data.uploadWatingQueue = {};
  if (!downloadWatingQueue) data.downloadWatingQueue = {};
  // if (!uploadFinishedQueue) data.uploadFinishedQueue = {};
  // if (!downloadFinishedQueue) data.downloadFinishedQueue = {};
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
    .then(() => log('Saved Updated Sync Data'))
    .catch((err) => log('Failed to Save Sync Data', err.message));

const MAX_PARALLEL_UPLOAD = 4;
const MAX_PARALLEL_DOWNLOAD = 4;

export const SynchronizationSlice = createSlice({
  name: 'Synchronization',
  initialState: GET(),
  reducers: {
    saveSyncData: (state) => {
      SAVE(state);
    },
    setRepositoryData: (state, action: setRepositoryDataInterface) => {
      const { RepoID, RepoName, folderData } = action.payload;
      state.RepoData[RepoID] = { RepoName, folderData };
    },
    addUpload: (state, action: addAction_Input) => {
      const { RepoID, data } = action.payload;

      if (!state.uploadWatingQueue[RepoID])
        state.uploadWatingQueue[RepoID] = [];

      state.uploadWatingQueue[RepoID] = [
        ...state.uploadWatingQueue[RepoID],
        ...data,
      ];

      state.totalSessionUploads += action.payload.data.length;
    },
    addDownload: (state, action: addAction_Input) => {
      const { RepoID, data } = action.payload;

      if (!state.downloadWatingQueue[RepoID])
        state.downloadWatingQueue[RepoID] = [];

      state.downloadWatingQueue[RepoID] = [
        ...state.downloadWatingQueue[RepoID],
        ...data,
      ];

      state.totalSessionDownloads += action.payload.data.length;
    },
    setUploadWatingQueue: (state, action: setWatingQueueInterface) => {
      state.uploadWatingQueue[action.payload.RepoID] = action.payload.data;
      state.totalSessionUploads += action.payload.data.length;
    },
    setDownloadWatingQueue: (state, action: setWatingQueueInterface) => {
      state.downloadWatingQueue[action.payload.RepoID] = action.payload.data;
      state.totalSessionDownloads += action.payload.data.length;
    },
    updateUploadingQueue: (state) => {
      Object.keys(state.uploadWatingQueue).forEach((RepoID) => {
        while (
          state.uploadingQueue.length < MAX_PARALLEL_UPLOAD &&
          state.uploadWatingQueue[RepoID].length
        ) {
          const cpyState = [...state.uploadWatingQueue[RepoID]];

          const newUploads = cpyState
            .splice(0, MAX_PARALLEL_UPLOAD - state.uploadingQueue.length)
            .map((val) => ({ ...val, RepoID, status: 'RUNNING' }));

          state.uploadWatingQueue[RepoID] = cpyState;
          state.uploadingQueue = [...state.uploadingQueue, ...newUploads];
        }
      });
    },
    updateDownloadingQueue: (state) => {
      Object.keys(state.downloadWatingQueue).forEach((RepoID) => {
        while (
          state.downloadingQueue.length < MAX_PARALLEL_DOWNLOAD &&
          state.downloadWatingQueue[RepoID].length
        ) {
          const cpyState = [...state.downloadWatingQueue[RepoID]];

          const newUploads = cpyState
            .splice(0, MAX_PARALLEL_DOWNLOAD - state.downloadingQueue.length)
            .map((val) => ({ ...val, RepoID, status: 'RUNNING' }));

          state.downloadWatingQueue[RepoID] = cpyState;
          state.downloadingQueue = [...state.downloadingQueue, ...newUploads];
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
  setRepositoryData,
  addUpload,
  addDownload,
  setUploadWatingQueue,
  setDownloadWatingQueue,
  updateUploadingQueue,
  updateDownloadingQueue,
} = SynchronizationSlice.actions;

export default SynchronizationSlice.reducer;
