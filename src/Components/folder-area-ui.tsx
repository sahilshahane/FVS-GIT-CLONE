/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import path from 'path';
import {
  RepositoryInfo,
  setCurrentDirectory,
} from '../Redux/UserRepositorySlicer';
import { changeMediaType } from '../Redux/MediaPlayerSlicer';

const checkExtensionType = (extName: string) => {
  switch (extName) {
    case '.mp4':
    case '.mpg':
    case '.webm':
    case '.ogg':
      return 'video';
    case '.jpg':
    case '.jpeg':
    case '.png':
      return 'image';
    default:
      return 'other';
  }
};

export const File = ({ currDir, filePath }: any) => {
  // console.log('File-UI recieved data ', fileInfo);
  const fileName = path.basename(filePath);
  const syncStatus = false;
  const dispatch = useDispatch();
  let classname = 'file-ui';
  const loc = filePath.lastIndexOf('.');
  const extName = filePath.substr(loc, filePath.length);

  const showVideo = () => () => {
    // eslint-disable-next-line default-case
    switch (checkExtensionType(extName)) {
      case 'video':
        dispatch(
          changeMediaType({
            mediaType: 'video',
            mediaPath: path.join(currDir, filePath),
          })
        );
        break;
      case 'image':
        dispatch(
          changeMediaType({
            mediaType: 'image',
            mediaPath: path.join(currDir, filePath),
          })
        );
        break;
    }
  };

  const extType = checkExtensionType(extName);
  if (extType === 'image' || extType === 'video') {
    classname += ' is-media';
  }

  return (
    <div className={classname} onDoubleClick={showVideo()}>
      <h3>{fileName}</h3>
      <span className={syncStatus ? 'synced-true' : 'synced-false'} />
    </div>
  );
};

export const Folder = ({ folderPath }: any) => {
  const dispatch = useDispatch();

  const folderName = path.basename(folderPath);

  const changeLocation = () => {
    dispatch(setCurrentDirectory({ localLocation: folderPath }));
  };

  const syncStatus = false;

  return (
    <div onDoubleClick={changeLocation} className="folder-ui">
      <h3>{folderName}</h3>
      <span className={syncStatus ? 'synced-true' : 'synced-false'} />
    </div>
  );
};

export const Repository = ({
  RepoID,
  info,
}: {
  RepoID: string;
  info: RepositoryInfo;
}) => {
  const dispatch = useDispatch();
  const { localLocation } = info;

  const changeLocation = () => {
    dispatch(setCurrentDirectory({ RepoID, localLocation }));
  };

  useEffect(() => {}, [info.syncStatus]);
  return (
    <div onDoubleClick={changeLocation} className="folder-ui">
      <h3>{info.displayName}</h3>
      <span className={info.syncStatus ? 'synced-true' : 'synced-false'} />
    </div>
  );
};

export { checkExtensionType };
