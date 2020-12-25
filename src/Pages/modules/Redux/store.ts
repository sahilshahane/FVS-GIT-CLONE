import { configureStore } from '@reduxjs/toolkit';
import AppSettingsReducer from './AppSettingsSlicer';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
  },
});
