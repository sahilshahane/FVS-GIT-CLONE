/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import path from 'path';
import { setCurrentDirectory } from '../Redux/UserRepositorySlicer';
import ReduxStore, { store } from '../Redux/store';

const changeLocation = async (pathIndex: number) => {
  const { UserRepoData } = ReduxStore.getState();
  const { currentDirectory } = UserRepoData;
  const { RepoID, localLocation } = currentDirectory;
  if (RepoID) {
    const RepositoryLocationArray = UserRepoData.info[
      RepoID
    ].localLocation.split(path.sep);
    const traversedLocation = localLocation
      ?.split(path.sep)
      .slice(0, RepositoryLocationArray.length + pathIndex)
      .join(path.sep);
    console.log('Going to', traversedLocation);
    ReduxStore.dispatch(
      setCurrentDirectory({ localLocation: traversedLocation })
    );
  }
};

const FileSysten_NavigationBar = () => {
  const currentDirectory = useSelector(
    (state: store) => state.UserRepoData.currentDirectory.localLocation
  );

  const RepoID = useSelector(
    (state: store) => state.UserRepoData.currentDirectory.RepoID
  );
  const dispatch = useDispatch();

  const UserRepoData = useSelector((state: store) => state.UserRepoData);

  const [BreadCrumbPath, setBreadCrumbPath] = useState<string[]>([]);

  useEffect(() => {
    if (currentDirectory !== 'Home' && currentDirectory && RepoID) {
      const RepoInfo = UserRepoData.info[RepoID];

      const newBreadLoc = currentDirectory
        .split(path.sep)
        .slice(RepoInfo.localLocation.split(path.sep).length);

      setBreadCrumbPath([RepoInfo.displayName, ...newBreadLoc]);
    } else setBreadCrumbPath([]);
  }, [RepoID, UserRepoData.info, currentDirectory]);

  return (
    <div>
      <Breadcrumb separator="/" className="component-bg breadcrumb">
        <Breadcrumb.Item
          className="breadcrumb-item"
          onClick={() =>
            dispatch(
              setCurrentDirectory({ RepoID: null, localLocation: 'Home' })
            )
          }
        >
          Home
        </Breadcrumb.Item>
        {BreadCrumbPath.map((pathName: string, pathIndex: number) => {
          return (
            <Breadcrumb.Item
              key={nanoid()}
              className="breadcrumb-item"
              onClick={() => changeLocation(pathIndex)}
            >
              {pathName}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default FileSysten_NavigationBar;
