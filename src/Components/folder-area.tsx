/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { fdir as FDIR } from 'fdir';
import log from 'electron-log';
import { File, Folder, Repository } from './folder-area-ui';
import { store } from '../Redux/store';

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
            <Repository
              key={nanoid()}
              RepoID={repoID}
              info={repositoryData[repoID]}
            />
          </Col>
        );
      })}
    </Row>
  );
};

// create the builder
const folderCrawler = new FDIR();
const fileCrawler = new FDIR();

const getFolders = (Path: string) => {
  return folderCrawler
    .withMaxDepth(1)
    .onlyDirs()
    .exclude((dirName) => dirName === '.usp')
    .crawl(Path)
    .withPromise()
    .then((folderPaths: Array<string>) => {
      folderPaths.shift();
      return folderPaths;
    });
};

const getFiles = (Path: string) => {
  return fileCrawler
    .withMaxDepth(0)
    .exclude((dirName) => dirName === '.usp')
    .filter((fileName) => fileName !== '.uspignore')
    .crawl(Path)
    .withPromise()
    .then((filePath: Array<string>) => {
      return filePath;
    });
};

const Selected_Repository_Directory = () => {
  const currentDirectory = useSelector((state: store) => {
    return state.UserRepoData.currentDirectory.localLocation;
  });

  const [sortBy, sortByType] = useSelector((state: store) => [
    state.AppSettings.directorySortBy.current,
    state.AppSettings.directorySortBy.type,
  ]);

  const [FILES, set_FILES] = useState([]);
  const [FOLDERS, set_FOLDERS] = useState([]);

  useEffect(() => {
    if (currentDirectory && currentDirectory !== 'Home') {
      // FOR FOLDERS
      getFolders(currentDirectory)
        .then((folderPaths) => set_FOLDERS(folderPaths))
        .catch((err) => log.error('Failed Retrieving Folders', err));

      // FOR FILES
      getFiles(currentDirectory)
        .then((filePaths) => set_FILES(filePaths))
        .catch((err) => log.error('Failed Retrieving Files', err));
    }
  }, [currentDirectory]);

  return (
    <Row gutter={[5, 5]} className="folder-area">
      {/* ~~~~~~~~~~~~~RENDERS FOLDER~~~~~~~~~~~~~ */}
      {FOLDERS.map((folderPath: string) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder id={nanoid()} folderPath={folderPath} />
          </Col>
        );
      })}

      {/* ~~~~~~~~~~~~~RENDERS FILES~~~~~~~~~~~~~ */}
      {FILES.map((filePath: string) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <File id={nanoid()} filePath={filePath} />
          </Col>
        );
      })}
    </Row>
  );
};

const DisplayArea = () => {
  const currentDirectory = useSelector((state: store) => {
    return state.UserRepoData.currentDirectory.localLocation;
  });

  return (
    <div id="SelectionArea">
      {currentDirectory === 'Home' ? (
        <ALL_Repositories />
      ) : (
        <Selected_Repository_Directory />
      )}
    </div>
  );
};

export default DisplayArea;
