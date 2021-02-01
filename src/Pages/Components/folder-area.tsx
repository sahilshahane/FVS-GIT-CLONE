/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';
import LiveDirView from '../modules/Live-Directory-View';

const ALL_Repositories = () => {
  const repositoryData = useSelector((state) => {
    return state.UserRepoData.info;
  });

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {repositoryData.map((Repository_INFO: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Repository id={nanoid()} info={Repository_INFO} />
          </Col>
        );
      })}
    </Row>
  );
};

const Selected_Repository_Directory = () => {
  const currentDirLocation = useSelector((state) => {
    return state.UserRepoData.currentDirLocation;
  });

  const [sortBy, sortByType] = useSelector((state) => [
    state.AppSettings.directorySortBy.current,
    state.AppSettings.directorySortBy.type,
  ]);

  const [FILES, set_FILES] = useState([]);
  const [FOLDERS, set_FOLDERS] = useState([]);

  useEffect(() => {
    set_FILES([]);
    set_FOLDERS([]);

    // LIVE RELOAD
    LiveDirView(
      currentDirLocation.join(path.sep), // 'currentDirLocation.join(path.sep)' = current directory path
      set_FILES,
      set_FOLDERS,
      sortBy,
      sortByType
    );
  }, [currentDirLocation, sortBy, sortByType]);

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {/* ~~~~~~~~~~~~~RENDERS FOLDER~~~~~~~~~~~~~ */}
      {FOLDERS.map((folderName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder id={nanoid()} info={folderName} />
          </Col>
        );
      })}

      {/* ~~~~~~~~~~~~~RENDERS FILES~~~~~~~~~~~~~ */}
      {FILES.map((fileName: any) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <File id={nanoid()} info={fileName} />
          </Col>
        );
      })}
    </Row>
  );
};

const DisplayArea = () => {
  const isRepositorySelected = useSelector((state) => {
    return state.UserRepoData.selectedRepository;
  });

  return (
    <div>
      {!isRepositorySelected ? (
        <ALL_Repositories />
      ) : (
        <Selected_Repository_Directory />
      )}
    </div>
  );
};

export default DisplayArea;
