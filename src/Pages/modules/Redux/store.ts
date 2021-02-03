/* eslint-disable import/no-named-as-default */
import { configureStore } from '@reduxjs/toolkit';

import AppSettingsReducer from './AppSettingsSlicer';
import User_Repository_Reducer, {
  USER_REPOSITORY_DATA_STRUCTURE,
} from './UserRepositorySlicer';
import SynchronizationSlice, {
  SYNC_DATA_STRUCTURE,
  SYNC_ACTIONS,
} from './SynchronizationSlicer';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
    UserRepoData: User_Repository_Reducer,
    Sync: SynchronizationSlice,
  },
  // middleware: [...getDefaultMiddleware({ immutableCheck: false })],
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface store {
  AppSettings: any;
  UserRepoData: USER_REPOSITORY_DATA_STRUCTURE;
  Sync: SYNC_DATA_STRUCTURE;
}
