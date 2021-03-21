import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs';
import log from 'electron-log';
import { APP_SETTINGS, APP_SETTINGS_FILE_PATH } from '../modules/get_AppData';

export interface AppSettings_DATA_STRUCTURE {
  repository_folderName: '.usp';
  available_cloudStorage: ['google_drive'];
  repositorySettings_fileName: 'repositorySettings.json';
  defaultIgnores: Array<string> | ['.usp', '.uspignore'];
  profileImage_fileName: 'profile.jpg';
  cloudLoginStatus: {
    googleDrive: any;
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

export const AppSettingsSlice = createSlice({
  name: 'AppSettings',
  initialState: APP_SETTINGS,
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
  },
});

export const {
  saveRepositorySettings,
  changeTheme,
  saveGoogleLogin,
} = AppSettingsSlice.actions;

export const CurrentSettings = (state: any) => state.AppSettings;

export const GetGoogleUsername = (state: any) => {
  try {
    return state.AppSettings.cloudLoginStatus.googleDrive.user.displayName;
  } catch (e) {
    return '';
  }
};

export default AppSettingsSlice.reducer;
