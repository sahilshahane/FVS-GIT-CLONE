import { createSlice } from '@reduxjs/toolkit';
import fs from 'fs';
import { APP_SETTINGS, APP_SETTINGS_PATH } from '../get_AppData';
import log from '../log';

export const AppSettingsSlice = createSlice({
  name: 'AppSettings',
  initialState: APP_SETTINGS,
  reducers: {
    saveSettings: (state) => {
      fs.writeFile(APP_SETTINGS_PATH, JSON.stringify(state, null, 2), (err) => {
        if (err) log('Failed to Save App Settings', err.message);
        else {
          log('Saved Updated App Settings');
        }
      });
    },
    changeTheme: (state, action) => {
      // eslint-disable-next-line default-case
      switch (action.payload) {
        case 'dark':
          log('Changed Theme to Dark');
          state.theme = 'dark';
          break;
        case 'light':
          log('Changed Theme to Light');
          state.theme = 'light';
          break;
      }
    },
    saveGoogleLogin: (state, action) => {
      state.cloudLoginStatus.googleDrive = action.payload;
    },
  },
});

export const {
  saveSettings,
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
