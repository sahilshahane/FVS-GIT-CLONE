import ReduxStore from './Redux/store';
import { addRepository } from './Redux/UserRepositorySlicer';
import { addUpload, addDownload } from './Redux/SynchronizationSlicer';
import { CCODES } from './get_AppData';

const { dispatch } = ReduxStore;

const Handler = (data: any) => {
  // eslint-disable-next-line default-case
  switch (data.code) {
    case CCODES.INIT_DONE:
      dispatch(
        addRepository({
          displayName: data.data.folderName,
          localLocation: data.data.localPath,
        })
      );
      break;
    case CCODES.ADD_UPLOAD:
      dispatch(addUpload(data.data));
      break;
    case CCODES.ADD_DOWNLOAD:
      dispatch(addDownload(data.data));
      break;
  }
};

export default Handler;
