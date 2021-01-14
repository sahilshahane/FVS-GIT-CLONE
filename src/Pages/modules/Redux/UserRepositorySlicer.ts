import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs-extra';
import path from 'path';
import {
  USER_REPOSITORY_DATA,
  USER_REPOSITORY_DATA_FILE_PATH,
} from '../get_AppData';
import log from '../log';

export interface RepositoryInfo {
  displayName: string;
  localLocation: string;
  syncStatus?: boolean;
}

export interface selectedRepo {
  RepoID: number;
  name: string;
  syncStatus: boolean;
  localLocation: string;
  directoryLevel: number;
}

export interface USER_REPOSITORY_DATA_STRUCTURE {
  info: Array<RepositoryInfo> | [];
  currentDirLocation: Array<string>;
  selectedRepository: selectedRepo | null;
}

const GET_INITIAL_STATE: () => USER_REPOSITORY_DATA_STRUCTURE = () =>
  USER_REPOSITORY_DATA;

export const USER_REPOSITORY_Slice = createSlice({
  name: 'UserRepoData',
  initialState: GET_INITIAL_STATE(),
  reducers: {
    addRepository: (
      state,
      action: {
        payload: RepositoryInfo;
        type: any;
      }
    ) => {
      let DATA: RepositoryInfo = action.payload;
      DATA.localLocation = path.normalize(DATA.localLocation);

      if (!action.payload.syncStatus) DATA.syncStatus = false;

      state.info = [...state.info, DATA];
    },

    saveCurrentLocation: (state) => {
      fs.promises
        .writeFile(USER_REPOSITORY_DATA_FILE_PATH, JSON.stringify(state))
        .catch((err) => {
          log('There was an error while updating the info.txt file', err);
        });
    },
    setCurrentDirLocation: (state, action) => {
      if (action.payload.length > 0) state.currentDirLocation = action.payload;
    },
    move_To_NextLocation: (state, action) => {
      // action.payload FolderName
      state.currentDirLocation.push(action.payload);
    },
    goBack_From_CurrentLocation: (
      state,
      action: { payload?: number; type: any }
    ) => {
      const PathIndex = action.payload;
      if (
        state.selectedRepository &&
        state.currentDirLocation.length <=
          state.selectedRepository.directoryLevel
      ) {
        state.selectedRepository = null;
        state.currentDirLocation = ['Home'];
      } else if (state.selectedRepository) {
        if (PathIndex != null) {
          // -1 Represents as ["Home"]
          if (PathIndex == -1) {
            state.selectedRepository = null;
            state.currentDirLocation = ['Home'];
          } else {
            state.currentDirLocation = state.currentDirLocation.splice(
              0,
              state.selectedRepository.directoryLevel + PathIndex
            );
          }
        } else state.currentDirLocation.pop();
      }
    },

    // THE 'change_Repository' should be async, for performance reason
    GoTo_Repository: (state, action) => {
      state.currentDirLocation = action.payload.localLocation.split(path.sep);

      // set Selected Repository
      state.selectedRepository = {
        ...action.payload,
        directoryLevel: state.currentDirLocation.length,
      };
    },
    setSelectedRepository: (
      state,
      action: {
        payload: selectedRepo;
        type: any;
      }
    ) => {
      // NOTE
      state.selectedRepository = action.payload;
    },
    saveUserRepository: (state) => {
      fs.promises
        .writeFile(USER_REPOSITORY_DATA_FILE_PATH, JSON.stringify(state))
        .then(() => {})
        .catch((err) => {
          log('There was an error while updating the info.txt file', err);
        });
    },
  },
});

export const {
  addRepository,
  saveCurrentLocation,
  setCurrentDirLocation,
  move_To_NextLocation,
  goBack_From_CurrentLocation,
  GoTo_Repository,
  setSelectedRepository,
  saveUserRepository,
} = USER_REPOSITORY_Slice.actions;

// export const GET_currentUserRepoData = (state: any) => state.UserRepoData;

// export const GET_selectedRepository = (state: any) =>
//   state.UserRepoData.selectedRepo;

// export const GET_currentDirLocation = (state: any) =>
//   state.UserRepoData.currentDirLocation;

// export const GET_AllRepositories = (state: any) => state.UserRepoData.info;

export default USER_REPOSITORY_Slice.reducer;
