/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../Redux/store';
import {
  GoTo_Repository,
  move_To_NextLocation,
  RepositoryInfo,
} from '../Redux/UserRepositorySlicer';

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~// FILE UI //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const File = ({ info }: any) => {
  // console.log('File-UI recieved data ', fileInfo);
  const fileName = info.name;
  const { syncStatus } = info;

  return (
    <div className="file-ui">
      <h3>{fileName.length > 20 ? `${fileName.slice(0, 20)}...` : fileName}</h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~// FOLDER UI //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const Folder = ({ info }: any) => {
  const dispatch = useDispatch();

  const { name, syncStatus } = info;

  const folderName = name;

  const moveInsideADir = () => {
    dispatch(move_To_NextLocation(folderName));
  };

  return (
    <div onDoubleClick={moveInsideADir} className="folder-ui">
      <h3>
        {folderName.length > 20 ? `${folderName.slice(0, 20)}...` : folderName}
      </h3>
      {syncStatus === true ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};

export const Repository = ({ info }: { info: RepositoryInfo }) => {
  const dispatch = useDispatch();

  const change_Repo = () => {
    dispatch(GoTo_Repository(info));
  };
  const uploadWatingQueue = useSelector(
    (state: store) => state.Sync.uploadWatingQueue[info]
  );
  const uploadingQueue = useSelector(
    (state: store) => state.Sync.uploadWatingQueue[info]
  );
  useEffect(() => {}, [info.syncStatus]);
  return (
    <div onDoubleClick={change_Repo} className="folder-ui">
      <h3>
        {info.displayName.length > 20
          ? `${info.displayName.slice(0, 20)}...`
          : info.displayName}
      </h3>
      {info.syncStatus ? (
        <span className="synced-true" />
      ) : (
        <span className="synced-false" />
      )}
    </div>
  );
};
