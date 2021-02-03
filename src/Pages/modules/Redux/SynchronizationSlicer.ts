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

export interface DoingQueue {
  fileName: string;
  filePath: string;
  driveID?: string;
  progress?: number;
  RepoID: number | string;
  status?: string;
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
    };
  };

  uploadingQueue: Array<DoingQueue>;

  uploadWatingQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  uploadFinishedQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  };
  downloadingQueue: Array<DoingQueue>;
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

  generatedIDs: Array<string>;
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
interface assignGeneratedIdsInterface {
  payload: { ids: Array<string>; RepoID: string | number };
  type?: any;
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
      const { uploadWatingQueue } = state;
      Object.keys(uploadWatingQueue).forEach((RepoID) => {
        if (state.uploadingQueue.length < MAX_PARALLEL_UPLOAD) {
          const newUploads: Array<DoingQueue> = uploadWatingQueue[
            RepoID
          ].filter((val, index) => {
            if (val.driveID) {
              uploadWatingQueue[RepoID].splice(index, 1);
              return true;
            }

            return false;
          })
            .splice(0, MAX_PARALLEL_UPLOAD - state.uploadingQueue.length)
            .map((val) => ({
              RepoID,
              fileName: val.fileName,
              filePath: val.filePath,
              driveID: val.driveID,
              status: 'RUNNING',
            }));

          if (newUploads.length)
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

          const newDownloads = cpyState
            .splice(0, MAX_PARALLEL_DOWNLOAD - state.downloadingQueue.length)
            .map((val) => ({
              fileName: val.fileName,
              filePath: val.filePath,
              RepoID,
              status: 'RUNNING',
            }));

          state.downloadWatingQueue[RepoID] = cpyState;
          state.downloadingQueue = [...state.downloadingQueue, ...newDownloads];
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
    assignGeneratedIds: (state, action: assignGeneratedIdsInterface) => {
      const { RepoID, ids } = action.payload;
      state.RepoData[RepoID].folderData = state.RepoData[RepoID].folderData.map(
        (val) => {
          if (!val.driveID && ids.length) val.driveID = ids.pop();
          return val;
        }
      );
      if (ids.length) {
        state.uploadWatingQueue[RepoID] = state.uploadWatingQueue[RepoID].map(
          (val) => {
            if (!val.driveID && ids.length) val.driveID = ids.pop();
            return val;
          }
        );
      }
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
  assignGeneratedIds,
} = SynchronizationSlice.actions;

export const SYNC_ACTIONS = SynchronizationSlice.actions;
export default SynchronizationSlice.reducer;
