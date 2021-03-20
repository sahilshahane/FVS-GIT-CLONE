/* eslint-disable import/no-named-as-default */
import { applyMiddleware, configureStore } from '@reduxjs/toolkit';

import AppSettingsReducer, {
  AppSettings_DATA_STRUCTURE,
} from './AppSettingsSlicer';
import User_Repository_Reducer, {
  USER_REPOSITORY_DATA_STRUCTURE,
  addRepository,
} from './UserRepositorySlicer';
import SynchronizationSlice, {
  SYNC_DATA_STRUCTURE,
  allocateRepoData,
  addUploadFinishedQueue,
  ReAddFailedUpload,
  addDownloadFinishedQueue,
  ReAddFailedDownload,
} from './SynchronizationSlicer';
import { updateUploads, updateDownloads } from '../modules/backgroundTasks';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
    UserRepoData: User_Repository_Reducer,
    Sync: SynchronizationSlice,
  },
  enhancers: [
    applyMiddleware((storeAPI) => (next) => (action) => {
      // eslint-disable-next-line default-case
      (async () => {
        switch (action.type) {
          case addRepository.type:
            next(action);
            // LOAD_UPLOADS_FROM_REPOSITORY(action.payload.RepoID);
            break;
          case allocateRepoData.type:
            next(action);
            updateUploads();
            updateDownloads();
            break;
          case addUploadFinishedQueue.type:
            next(action);
            updateUploads();
            break;
          case ReAddFailedUpload.type:
            next(action);
            updateUploads();
            break;
          case addDownloadFinishedQueue.type:
            next(action);
            updateDownloads();
            break;
          case ReAddFailedDownload.type:
            next(action);
            updateDownloads();
            break;
          default:
            next(action);
        }
      })();
    }),
  ],
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface store {
  AppSettings: AppSettings_DATA_STRUCTURE;
  UserRepoData: USER_REPOSITORY_DATA_STRUCTURE;
  Sync: SYNC_DATA_STRUCTURE;
}
