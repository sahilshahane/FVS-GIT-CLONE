import { batch } from 'react-redux';
import ReduxStore from './Redux/store';
import { addRepository } from './Redux/UserRepositorySlicer';
import {
  allocateRepoData,
  updateUploadingQueue,
  addUploadFinishedQueue,
  ReAddFailedUpload,
} from './Redux/SynchronizationSlicer';
import { CCODES } from './get_AppData';
import ShowError, { ShowInfo } from './ErrorPopup_dialog';

const { dispatch } = ReduxStore;

const Handler = (response: {
  code: number;
  data?: any;
  exception?: { msg: string; type: string };
}) => {
  // eslint-disable-next-line default-case
  switch (response.code) {
    case CCODES.INIT_DONE:
      dispatch(
        addRepository({
          displayName: response.data.folderName,
          localLocation: response.data.localPath,
        })
      );
      break;
    case CCODES.FOLDERS_CREATED:
      dispatch(
        allocateRepoData({
          RepoID: response.data.RepoID,
          folderData: response.data.folderData,
        })
      );
      break;
    case CCODES.ADD_UPLOAD:
      break;
    case CCODES.ADD_DOWNLOAD:
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
        'Failed to Allocated Folders!',
        `${response.exeception?.type} : ${response.exeception?.msg}`
      );
      break;
    case CCODES.UPLOAD_SUCCESS:
      dispatch(
        addUploadFinishedQueue({
          RepoID: response.data.RepoID,
          driveID: response.data.driveID,
          fileName: response.data.fileName,
          parentPath: response.data.parentPath,
        })
      );
      break;
    case CCODES.UPLOAD_FAILED:
      dispatch(ReAddFailedUpload(response.data));
      if (process.env.NODE_ENV === 'development')
        ShowError(
          'Upload Failed',
          `${response.data.fileName}\n${response.exception?.type} : ${response.exception?.msg}`
        );
  }
};

export default Handler;
