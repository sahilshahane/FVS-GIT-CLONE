import { batch } from 'react-redux';
import log from 'electron-log';
import ReduxStore from '../Redux/store';
import {
  addRepository,
  setRepositoryTrackingInfo,
} from '../Redux/UserRepositorySlicer';
import {
  updateUploadingQueue,
  addUploadFinishedQueue,
  addDownloadFinishedQueue,
  updateDownloadingQueue,
} from '../Redux/SynchronizationSlicer';
import { CCODES } from './get_AppData';
import ShowError, { ShowInfo } from './ErrorPopup_dialog';
import {
  saveGoogleLogin,
  saveRepositorySettings,
} from '../Redux/AppSettingsSlicer';
import {
  setRepoDownload,
  updateFilesDriveID,
  updateFolderDriveID,
} from './Database';
import { performGDriveChanges, createRepoFoldersInDrive } from './GoogleDrive';

const { dispatch } = ReduxStore;

const Handler = (
  response: {
    code: number;
    data?: any;
    exception?: { msg: string; type: string };
  },
  history: History<unknown>
) => {
  // eslint-disable-next-line default-case
  switch (response.code) {
    case CCODES.INIT_DONE:
      dispatch(
        addRepository({
          displayName: response.data.RepositoryName,
          localLocation: response.data.localPath,
          RepoID: response.data.RepoID,
        })
      );

      // CREATE FOLDERS
      createRepoFoldersInDrive(
        response.data.RepoID,
        response.data.RepositoryName
      );

      break;
    case CCODES.INIT_FAILED:
      log.error('Failed to Initialize Repository', response);
      break;
    case CCODES.ALL_FOLDERS_CREATED_DRIVE:
      log.info('Uncreated Folders are Created in drive', response.data);

      // UPDATE UPLOADS
      dispatch(updateUploadingQueue(ReduxStore.getState().UserRepoData));

      break;
    case CCODES.FOLDER_CREATED_DRIVE:
      updateFolderDriveID(response.data.RepoID, {
        folder_id: response.data.folder_id,
        driveID: response.data.driveID,
      }).catch((exception) =>
        log.error("Failed to Update folder's data locally", {
          response,
          exception,
        })
      );

      break;
    case CCODES.REPO_FOLDER_CREATED_DRIVE:
      updateFolderDriveID(response.data.RepoID, {
        folder_id: response.data.folder_id,
        driveID: response.data.trackingInfo.driveID,
      })
        .then(() => {
          dispatch(
            setRepositoryTrackingInfo({
              RepoID: response.data.RepoID,
              trackingInfo: response.data.trackingInfo,
            })
          );
          return null;
        })
        .catch((exception) =>
          log.error("Failed to Update Repository's driveID data locally", {
            response,
            exception,
          })
        );

      break;

    case CCODES.REPO_EXISTS:
      if (process.env.NODE_ENV === 'development')
        ShowInfo(
          'Repository Already Exists',
          'Please Remove the .usp folder [This Dialog will only be shown in Development mode]'
        );
      break;

    case CCODES.UPLOAD_SUCCESS:
      updateFilesDriveID(response.data.RepoID, {
        folder_id: response.data.folder_id,
        driveID: response.data.driveID,
        fileName: response.data.fileName,
      })
        .then(() => {
          dispatch(
            addUploadFinishedQueue({
              RepoID: response.data.RepoID,
              driveID: response.data.driveID,
              fileName: response.data.fileName,
              filePath: response.data.filePath,
            })
          );
          return null;
        })
        .catch((err) =>
          log.error('Failed Updating Uploaded file locally', {
            response,
            exception: err,
          })
        );

      break;
    case CCODES.UPLOAD_FAILED:
      // UPDATE UPLOADS
      dispatch(updateUploadingQueue(ReduxStore.getState().UserRepoData));

      break;
    case CCODES.DOWNLOAD_SUCCESS:
      try {
        setRepoDownload(response.data.RepoID, {
          driveID: response.data.driveID,
          type: 'COMPLETE',
        });

        dispatch(
          addDownloadFinishedQueue({
            RepoID: response.data.RepoID,
            driveID: response.data.driveID,
            fileName: response.data.fileName,
            filePath: response.data.filePath,
          })
        );
      } catch (err) {
        log.error('Failed Updating Uploaded file locally', {
          response,
          exception: err,
        });
      }

      break;
    case CCODES.DOWNLOAD_FAILED:
      // UPDATE DOWNLOADS
      dispatch(updateDownloadingQueue(ReduxStore.getState().UserRepoData));

      break;
    case CCODES.GOOGLE_LOGIN_SUCCESS:
      batch(() => {
        dispatch(saveGoogleLogin(response.data));
        dispatch(saveRepositorySettings());
      });

      break;
    case CCODES.FINISHED_CHECKING_CHANGES:
      performGDriveChanges({
        RepoID: response.data.RepoID,
        changes: response.data.changes,
        trackingInfo: response.data.trackingInfo,
      });
      break;
  }
};

export default Handler;
