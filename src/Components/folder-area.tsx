/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';
import LiveDirView from '../modules/Live-Directory-View';
import { store } from '../Redux/store';
import { Menu, Dropdown } from 'antd';

const menu = (
  <Menu>
    <Menu.Item key="1">1st menu item</Menu.Item>
    <Menu.Item key="2">2nd menu item</Menu.Item>
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);

const ALL_Repositories = () => {
  const repositoryData = useSelector((state: store) => {
    return state.UserRepoData.info;
  });

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {Object.keys(repositoryData).map((repoID) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Repository key={nanoid()} info={repositoryData[repoID]} />
          </Col>
        );
      })}
    </Row>
  );
};

const Selected_Repository_Directory = () => {
  const currentDirLocation = useSelector((state: store) => {
    return state.UserRepoData.currentDirLocation;
  });

  const [sortBy, sortByType] = useSelector((state: store) => [
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
  const isRepositorySelected = useSelector((state: store) => {
    return state.UserRepoData.selectedRepository;
  });

  return (


    <div>
      <Dropdown overlay={menu} trigger={['contextMenu']}>
        <div>
      {isRepositorySelected ? (
        <Selected_Repository_Directory />
      ) : (
        <ALL_Repositories />
      )}
      </div>
      </Dropdown>
    </div>

  );
};

export default DisplayArea;
