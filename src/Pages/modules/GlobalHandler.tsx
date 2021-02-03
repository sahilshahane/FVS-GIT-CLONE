import ReduxStore from './Redux/store';
import { addRepository } from './Redux/UserRepositorySlicer';
import {
  addUpload,
  addDownload,
  assignGeneratedIds,
  updateUploadingQueue,
} from './Redux/SynchronizationSlicer';
import { CCODES } from './get_AppData';
import { ShowInfo } from './ErrorPopup_dialog';
import { batch } from 'react-redux';

const { dispatch } = ReduxStore;

const Handler = (response: { code: number; data?: any }) => {
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
    case CCODES.GENERATE_IDS:
      batch(() => {
        dispatch(
          assignGeneratedIds({
            RepoID: response.data.RepoID,
            ids: response.data.ids,
          })
        );

        dispatch(updateUploadingQueue());
      });

      break;
    case CCODES.ADD_UPLOAD:
      dispatch(addUpload(response.data));
      break;
    case CCODES.ADD_DOWNLOAD:
      dispatch(addDownload(response.data));
      break;
    case CCODES.REPO_EXISTS:
      if (process.env.NODE_ENV === 'development')
        ShowInfo(
          'Repository Already Exists',
          'Please Remove the .usp folder [This Dialog will only be shown in Development mode]'
        );
      break;
  }
};

export default Handler;
