/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs-extra';
import path from 'path';
import {
  USER_REPOSITORY_DATA,
  USER_REPOSITORY_DATA_FILE_PATH,
} from '../modules/get_AppData';

export type trackingInfo_ = {
  lastChecked: string;
  driveID: string;
};
export type currentDirectory = {
  RepoID: string | null;
  localLocation: string | null;
};

export interface RepositoryInfo {
  displayName: string;
  localLocation: string;
  syncStatus?: boolean;
  trackingInfo?: trackingInfo_;
}

export interface selectedRepo {
  id: number;
  name: string;
  syncStatus: boolean;
  localLocation: string;
  directoryLevel: number;
}
export interface selectedRepoInterface {
  payload: string;
  type: any;
}
export interface USER_REPOSITORY_DATA_STRUCTURE {
  info: {
    [RepoID: string]: RepositoryInfo;
  };
  currentDirectory: currentDirectory;
}

interface addRepositoryinterface {
  payload: {
    displayName: string;
    localLocation: string;
    RepoID: number | string;
  };
  type: any;
}

interface setSyncStatus {
  payload: {
    status: boolean;
    RepoID: number | string;
  };
}

interface setRepositoryTrackingInfo_ {
  payload: {
    RepoID: string;
    trackingInfo: trackingInfo_;
  };
}

interface setCurrentDirectory_ {
  payload: {
    RepoID?: string;
    localLocation?: string;
  };
}

const GET_INITIAL_STATE: () => USER_REPOSITORY_DATA_STRUCTURE = () => {
  const data: USER_REPOSITORY_DATA_STRUCTURE = USER_REPOSITORY_DATA;

  if (!(data.info && Object.keys(data.info).length)) data.info = {};
  data.currentDirectory = { RepoID: null, localLocation: 'Home' };
  return { ...USER_REPOSITORY_DATA, ...data };
};
const SAVE = async (state: USER_REPOSITORY_DATA_STRUCTURE) => {
  fs.promises.writeFile(USER_REPOSITORY_DATA_FILE_PATH, JSON.stringify(state));
};
export const USER_REPOSITORY_Slice = createSlice({
  name: 'UserRepoData',
  initialState: GET_INITIAL_STATE(),
  reducers: {
    addRepository: (state, action: addRepositoryinterface) => {
      const DATA = action.payload;
      DATA.localLocation = path.normalize(DATA.localLocation);

      state.info[DATA.RepoID] = {
        displayName: DATA.displayName,
        localLocation: DATA.localLocation,
      };
    },
    setRepositoryTrackingInfo: (state, action: setRepositoryTrackingInfo_) => {
      const { RepoID, trackingInfo } = action.payload;

      if (state.info[RepoID].trackingInfo)
        // UPDATE THE STATE FOR FASTER DATA ACCESS
        state.info[RepoID].trackingInfo = {
          ...state.info[RepoID].trackingInfo,
          ...trackingInfo,
        };
      else state.info[RepoID].trackingInfo = trackingInfo;

      const localPath = state.info[RepoID].localLocation;
      const repositoryDataPath = path.join(localPath, '.usp', 'data.json');

      // READ REPO DATA / SETTINGS
      const repositoryData = fs.readJSONSync(repositoryDataPath);

      // WRITE REPO DATA / SETTINGS
      fs.writeJSONSync(repositoryDataPath, {
        ...repositoryData,
        ...state.info[RepoID].trackingInfo,
      });
    },
    setCurrentDirectory: (state, action: setCurrentDirectory_) => {
      const { RepoID, localLocation } = action.payload;
      if (!localLocation)
        state.currentDirectory = {
          ...state.currentDirectory,
          localLocation: 'Home',
        };
      else if (localLocation !== state.currentDirectory.localLocation) {
        state.currentDirectory = { ...state.currentDirectory, localLocation };
      }

      if (RepoID) state.currentDirectory.RepoID = RepoID;
    },
    saveUserRepositoryData: (state) => {
      SAVE(state);
    },
    setSyncStatus: (state, action: setSyncStatus) => {
      const { RepoID, status } = action.payload;
      state.info[RepoID].syncStatus = status;
    },
  },
});

export const {
  addRepository,
  setCurrentDirectory,
  saveUserRepositoryData,
  setRepositoryTrackingInfo,
} = USER_REPOSITORY_Slice.actions;

export default USER_REPOSITORY_Slice.reducer;
