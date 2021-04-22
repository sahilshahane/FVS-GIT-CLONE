/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import { useDispatch } from 'react-redux';
import path from 'path';
import { FaImage, FaVideo } from 'react-icons/fa';
import {
  RepositoryInfo,
  setCurrentDirectory,
} from '../Redux/UserRepositorySlicer';
import { getMediaType } from '../modules/MediaPlayer';
import { showMediaPlayer } from '../Redux/MediaPlayerSlicer';

export const File = ({ currDir, filePath }: any) => {
  const fileName = path.basename(filePath);
  const syncStatus = false;
  const dispatch = useDispatch();
  const mediaType = getMediaType(fileName);
  let classname = 'file-ui';

  const HandleShowMediaPlayer = () => {
    if (getMediaType(fileName) !== 'other') {
      dispatch(showMediaPlayer(path.normalize(currDir + path.sep + filePath)));
    }
  };

  if (mediaType !== 'other') {
    mediaType === 'video'
      ? (classname += ' video-media')
      : (classname += ' image-media');
  }

  return (
    <div className={classname} onDoubleClick={HandleShowMediaPlayer}>
      <h3>{fileName}</h3>
      {classname.indexOf('video-media') !== -1 && <FaVideo />}
      {classname.indexOf('image-media') !== -1 && <FaImage />}
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

  return (
    <div onDoubleClick={changeLocation} className="folder-ui">
      <h3>{info.displayName}</h3>
      <span className={info.syncStatus ? 'synced-true' : 'synced-false'} />
    </div>
  );
};
