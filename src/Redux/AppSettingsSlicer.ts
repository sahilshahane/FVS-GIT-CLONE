/* eslint-disable @typescript-eslint/naming-convention */
import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs';
import os, { homedir } from 'os';
import path from 'path';
import log from 'electron-log';
import { APP_SETTINGS, APP_SETTINGS_FILE_PATH } from '../modules/get_AppData';

export interface AppSettings_DATA_STRUCTURE {
  repository_folderName: '.usp';
  available_cloudStorage: ['google_drive'];
  repositorySettings_fileName: 'repositorySettings.json';
  defaultIgnores: Array<string> | ['.usp', '.uspignore'];
  profileImage_fileName: 'profile.jpg';
  local_profileimage_info?: {
    type: string;
    url: string;
  };
  cloudLoginStatus: {
    googleDrive: {
      user: {
        displayName: string;
        photoLink: string;
        permissionId: string;
        emailAddress: string;
      };
      storageQuota: {
        limit: string;
        usage: string;
        usageInDrive: string;
        usageInDriveTrash: string;
      };
      rootFolderDriveID: string;
    };
  };
  theme: 'dark' | 'light';
  globalIgnores: Array<string> | [];
  directorySortBy: {
    options: {
      Name: 'name';
      'Date Accessed': 'atimeMs';
      'Date Modified': 'mtimeMs';
      'Date Created': 'birthtimeMs';
      Size: 'size';
    };
    current: 'name' | 'atimeMs' | 'mtimeMs' | 'birthtimeMs';
    type: 'ascending' | 'descending';
  };
}
const GET: () => AppSettings_DATA_STRUCTURE = () => APP_SETTINGS;

export const AppSettingsSlice = createSlice({
  name: 'AppSettings',
  initialState: GET(),
  reducers: {
    saveRepositorySettings: (state) => {
      fs.writeFileSync(
        APP_SETTINGS_FILE_PATH,
        JSON.stringify(state, null, 2),
        (err: { message: any }) => {
          if (err) log.error('Failed to Save App Settings', err.message);
          else {
            log.info('Saved Updated App Settings');
          }
        }
      );
    },
    changeTheme: (state, action) => {
      // eslint-disable-next-line default-case
      switch (action.payload) {
        case 'dark':
          log.info('Changed Theme to Dark');
          state.theme = 'dark';
          break;
        case 'light':
          log.info('Changed Theme to Light');
          state.theme = 'light';
          break;
      }
    },
    saveGoogleLogin: (state, action) => {
      state.cloudLoginStatus.googleDrive = action.payload;
      log.info('Saved Google Login');
    },
    setLocalProfilePhotoOption: (state, action) => {
      const DATA = action.payload.localImage;
      const PathToDotUSP = path.join(os.homedir(), '.usp');

      if (DATA.type === 'file') {
        const fileName = path.basename(DATA.url);

        fs.copyFileSync(DATA.url, path.join(PathToDotUSP, `Profile.jpg`));
        state.local_profileimage_info = {
          ...DATA,
          url: path.join(PathToDotUSP, 'Profile.jpg'),
        };
        log.info('Setting a new local image as the profile photo');
      } else {
        state.local_profileimage_info = {
          ...DATA,
          url: path.join(PathToDotUSP, `Profile.jpg`),
        };
      }

      fs.writeFileSync(
        APP_SETTINGS_FILE_PATH,
        JSON.stringify(state, null, 2),
        (err: { message: any }) => {
          if (err) log.error('Failed to Save App Settings', err.message);
          else {
            log.info('Saved Updated App Settings');
          }
        }
      );
    },
  },
});

export const {
  saveRepositorySettings,
  changeTheme,
  saveGoogleLogin,
  setLocalProfilePhotoOption,
} = AppSettingsSlice.actions;

export const CurrentSettings = (state: any) => state.AppSettings;

export const GetGoogleUsername = (state: any) => {
  try {
    return state.AppSettings.cloudLoginStatus.googleDrive.user.displayName;
  } catch (e) {
    return '';
  }
};

export const GetGoogleProfilePictureURL = (state: any) => {
  try {
    return state.AppSettings.cloudLoginStatus.googleDrive.user.photoLink;
  } catch (e) {
    return '';
  }
};

export const LocalProfileImageSelected = (state: any) => {
  if (state.AppSettings.local_profileimage_info) {
    return state.AppSettings.local_profileimage_info;
  }
  return false;
};

export const RemoveProfileImageSelected = (state: any) => {
  if (state.AppSettings.local_profileimage_info) {
    delete state.AppSettings.local_profileimage_info;
    log.info('Deleted the local profile picture image info ');
  }
};

export default AppSettingsSlice.reducer;
