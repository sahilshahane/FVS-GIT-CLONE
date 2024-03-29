/* eslint-disable import/no-cycle */
/* eslint-disable import/no-named-as-default */
import { applyMiddleware, configureStore } from '@reduxjs/toolkit';

import AppSettingsReducer, {
  AppSettings_DATA_STRUCTURE,
} from './AppSettingsSlicer';
import User_Repository_Reducer, {
  removeRepository,
  USER_REPOSITORY_DATA_STRUCTURE,
} from './UserRepositorySlicer';
import SynchronizationSlice, {
  addUploadFinishedQueue,
  removeRepositorySyncData,
  SYNC_DATA_STRUCTURE,
  updateUploadingQueue,
} from './SynchronizationSlicer';
import MediaPlayerSlice, { MEDIA_PLAYER_INTERFACE } from './MediaPlayerSlicer';

export default configureStore({
  reducer: {
    AppSettings: AppSettingsReducer,
    UserRepoData: User_Repository_Reducer,
    Sync: SynchronizationSlice,
    MediaPlayer: MediaPlayerSlice,
  },
  enhancers: [
    applyMiddleware((storeAPI) => (next) => (action) => {
      // eslint-disable-next-line default-case
      (async () => {
        switch (action.type) {
          case addUploadFinishedQueue.type:
            next(action);
            storeAPI.dispatch(
              updateUploadingQueue(storeAPI.getState().UserRepoData)
            );
            break;
          case removeRepository.type:
            next(removeRepositorySyncData(action));
            next(action);
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
  MediaPlayer: MEDIA_PLAYER_INTERFACE;
}
