import { batch } from 'react-redux';
import log from 'electron-log';
import ReduxStore from '../Redux/store';
import { addRepository } from '../Redux/UserRepositorySlicer';
import {
  updateUploadingQueue,
  addUploadFinishedQueue,
} from '../Redux/SynchronizationSlicer';
import { CCODES } from './get_AppData';
import ShowError, { ShowInfo } from './ErrorPopup_dialog';
import {
  saveGoogleLogin,
  saveRepositorySettings,
} from '../Redux/AppSettingsSlicer';
import { createRepoFoldersInDrive } from './backgroundTasks';
import { updateFilesDriveID, updateFolderDriveID } from './Database';

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
    case CCODES.FOLDERS_CREATED:
      log.info('Folders created in drive', response.data);
      updateFolderDriveID(response.data.RepoID, response.data.folderData)
        .then(() => {
          const { UserRepoData } = ReduxStore.getState();
          dispatch(updateUploadingQueue(UserRepoData));
          return null;
        })
        .catch((exception) =>
          log.error('Failed to Update folder data locally', {
            response,
            exception,
          })
        );
      // dispatch(updateUploadingQueue());

      break;
    case CCODES.REPO_EXISTS:
      if (process.env.NODE_ENV === 'development')
        ShowInfo(
          'Repository Already Exists',
          'Please Remove the .usp folder [This Dialog will only be shown in Development mode]'
        );
      break;
    case CCODES.FAILED_CREATE_FOLDERS:
      ShowError(
        'Failed to allocated folders in drive.',
        `${response.exception?.type} : ${response.exception?.msg}`
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
      // dispatch(ReAddFailedUpload(response.data));
      // if (process.env.NODE_ENV === 'development')
      //   ShowError(
      //     'Upload Failed',
      //     `${response.data.fileName}\n${response.exception?.type} : ${response.exception?.msg}`
      //   );
      break;
    case CCODES.GOOGLE_LOGIN_SUCCESS:
      batch(() => {
        dispatch(saveGoogleLogin(response.data));
        dispatch(saveRepositorySettings());
      });

      break;
  }
};

export default Handler;
