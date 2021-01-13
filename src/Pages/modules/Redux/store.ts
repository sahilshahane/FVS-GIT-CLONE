import { configureStore } from '@reduxjs/toolkit';
import AppSettingsReducer from './AppSettingsSlicer';
import User_Repository_Reducer from './UserRepositorySlicer';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
    UserRepoData: User_Repository_Reducer,
  },
});
