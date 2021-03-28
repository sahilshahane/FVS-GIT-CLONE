/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import path from 'path';
import log from 'electron-log';
import {
  RepositoryInfo,
  setCurrentDirectory,
} from '../Redux/UserRepositorySlicer';

export const File = ({ filePath }: any) => {
  // console.log('File-UI recieved data ', fileInfo);
  const fileName = path.basename(filePath);
  const syncStatus = false;

  return (
    <div className="file-ui">
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
