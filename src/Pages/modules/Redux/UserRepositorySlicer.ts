/* eslint-disable @typescript-eslint/naming-convention */
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
  id: number;
  name: string;
  syncStatus: boolean;
  localLocation: string;
  directoryLevel: number;
}
export interface selectedRepoInterface {
  payload: selectedRepo;
  type: any;
}
export interface USER_REPOSITORY_DATA_STRUCTURE {
  info: {
    [RepoID: string]: RepositoryInfo;
  };
  currentDirLocation: Array<string>;
  selectedRepository: selectedRepo | null;
}

interface addRepositoryinterface {
  payload: {
    displayName: string;
    localLocation: string;
  };
  type: any;
}

const GET_INITIAL_STATE: () => USER_REPOSITORY_DATA_STRUCTURE = () => {
  const data: USER_REPOSITORY_DATA_STRUCTURE = USER_REPOSITORY_DATA;

  if (!(data.info && Object.keys(data.info).length)) data.info = {};
  if (!data.currentDirLocation) data.currentDirLocation = ['Home'];

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
      const DATA: RepositoryInfo = action.payload;
      DATA.localLocation = path.normalize(DATA.localLocation);
      const id = Object.keys(state.info).length + 1;

      state.info[id] = DATA;

      SAVE(state);
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
    setSelectedRepository: (state, action: selectedRepoInterface) => {
      // NOTE
      state.selectedRepository = action.payload;
    },
    saveUserRepositoryDataSync: (state) => {
      SAVE(state);
    },
  },
});

export const {
  addRepository,
  setCurrentDirLocation,
  move_To_NextLocation,
  goBack_From_CurrentLocation,
  GoTo_Repository,
  setSelectedRepository,
  saveUserRepositoryDataSync,
} = USER_REPOSITORY_Slice.actions;

export default USER_REPOSITORY_Slice.reducer;
