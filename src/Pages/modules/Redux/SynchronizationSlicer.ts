/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs-extra';
import { SYNC_DATA, SYNC_DATA_FILE_PATH } from '../get_AppData';
import log from '../log';

export interface SYNC_INPUT {
  RepoId: string;
  filePath: string;
  driveID: string;
  fileName: string;
  status: 'WAITING' | 'RUNNING' | 'PAUSED' | 'FAILED' | 'FINISHED';
}

export interface SYNC_DATA_STRUCTURE {
  uploads: Array<SYNC_INPUT> | [] | null;
  downloads: Array<SYNC_INPUT> | [] | null;
  showUploadsDrawer?: boolean;
  showDownloadsDrawer?: boolean;
}

const GET: () => SYNC_DATA_STRUCTURE = () => SYNC_DATA;
const SAVE = (data: SYNC_DATA_STRUCTURE) =>
  fs
    .writeFile(
      SYNC_DATA_FILE_PATH,
      JSON.stringify(
        {
          uploads: data.uploads,
          downloads: data.downloads,
        },
        null,
        2
      )
    )
    .then(() => log('Saved Updated Sync Data'))
    .catch((err) => log('Failed to Save Sync Data', err.message));

export const SynchronizationSlice = createSlice({
  name: 'Synchronization',
  initialState: GET(),
  reducers: {
    saveSyncData: (state) => {
      SAVE(state);
    },
    addUpload: (state, action: { payload: SYNC_INPUT; type?: any }) => {
      if (state.uploads) state.uploads = [...state.uploads, action.payload];
      else state.uploads = [action.payload];
      SAVE(state);
    },
    addDownload: (state, action: { payload: SYNC_INPUT; type?: any }) => {
      if (state.downloads)
        state.downloads = [...state.downloads, action.payload];
      else state.downloads = [action.payload];

      SAVE(state);
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
  addDownload,
  addUpload,
  showDownloadsDrawer,
  showUploadsDrawer,
  closeSyncDrawer,
} = SynchronizationSlice.actions;

export default SynchronizationSlice.reducer;
