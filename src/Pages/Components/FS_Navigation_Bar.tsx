import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, nanoid } from '@reduxjs/toolkit';
import { Breadcrumb } from 'antd';
import {
  RepositoryInfo,
  goBack_From_CurrentLocation,
} from '../modules/Redux/UserRepositorySlicer';

const updateLocation = (
  currentDirLocation: Array<String>,
  selectedRepository: RepositoryInfo
) => {
  // if selectedRepository === null then you'll be in Home
  if (!selectedRepository) return ['Home'];

  const RepositoryName =
    selectedRepository.displayName || selectedRepository.name;

  return [
    'Home',
    RepositoryName,
    ...[...currentDirLocation].splice(selectedRepository.directoryLevel),
  ];
};

const change_currentLocation = async (
  dispatch: Dispatch<any>,
  PathIndex: number | null = null
) => {
  if (PathIndex != null) {
    // Excluding ["Home"]
    PathIndex = PathIndex - 1;

    dispatch(goBack_From_CurrentLocation(PathIndex));
  } else dispatch(goBack_From_CurrentLocation());
};

const Routing = () => {
  const [currentDirLocation, selectedRepository] = useSelector((state) => [
    state.UserRepoData.currentDirLocation,
    state.UserRepoData.selectedRepository,
  ]);
  const dispatch = useDispatch();

  const [BreadCrumbPath, setBreadCrumbPath] = useState(currentDirLocation);

  useEffect(() => {
    // UPDATE THE LOCATION, UPDATES ONLY FS_Navigation_Bar
    setBreadCrumbPath(() =>
      updateLocation(currentDirLocation, selectedRepository)
    );
  }, [currentDirLocation]);

  return (
    <div onDoubleClick={() => change_currentLocation(dispatch)}>
      <Breadcrumb separator="/" className="breadcrumb">
        {BreadCrumbPath.map((Path_Name: any, PathIndex: number) => {
          return (
            <Breadcrumb.Item
              key={nanoid()}
              className="breadcrumb-item"
              onClick={() => change_currentLocation(dispatch, PathIndex)}
            >
              {Path_Name}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default Routing;
