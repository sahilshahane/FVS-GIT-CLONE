/* eslint-disable import/no-named-as-default */
import { configureStore } from '@reduxjs/toolkit';
import AppSettingsReducer from './AppSettingsSlicer';
import User_Repository_Reducer from './UserRepositorySlicer';
import SynchronizationSlice from './SynchronizationSlicer';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
    UserRepoData: User_Repository_Reducer,
    Sync: SynchronizationSlice,
  },
});
