/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { fdir as FDIR } from 'fdir';
import log from 'electron-log';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';
import { store } from '../Redux/store';
import { setMediaFileStack } from '../Redux/MediaPlayerSlicer';
import { getAllFilesWithPaths } from '../modules/Database';

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
const folderCrawler = new FDIR()
  .withMaxDepth(1)
  .onlyDirs()
  .exclude((dirName) => dirName === '.usp');
const fileCrawler = new FDIR()
  .withMaxDepth(0)
  .exclude((dirName) => dirName === '.usp')
  .filter((fileName) => fileName !== '.uspignore');

const getFolders: (Path: string) => Promise<string[]> = async (Path) => {
  const folders = folderCrawler.crawl(Path).sync();
  folders.shift();
  return folders;
};

const getFiles: (Path: string) => Promise<string[]> = async (Path: string) => {
  const files = fileCrawler.crawl(Path).sync();
  return files;
};

const Selected_Repository_Directory = () => {
  const currentDirectory = useSelector((state: store) => {
    return state.UserRepoData.currentDirectory.localLocation;
  });
  const [sortBy, sortByType] = useSelector((state: store) => [
    state.AppSettings.directorySortBy.current,
    state.AppSettings.directorySortBy.type,
  ]);
  const [FILES, set_FILES] = useState<string[]>([]);
  const [FOLDERS, set_FOLDERS] = useState<string[]>([]);
  const dispatch = useDispatch();
  const repositoryData = useSelector((state: store) => {
    return state.UserRepoData.info;
  });
  const syncStatusInfo = {};

  if (FILES) {
    let currentRepoID = '';

    Object.keys(repositoryData).forEach((RepoID) => {
      if (currentDirectory.includes(repositoryData[RepoID].localLocation)) {
        currentRepoID = RepoID;
      }
    });
    getAllFilesWithPaths(currentRepoID).forEach((file) => {
      const absPath = path.join(currentDirectory, file.fileName);
      syncStatusInfo[absPath] = file.uploaded;
    });
  }

  useEffect(() => {
    if (currentDirectory && currentDirectory !== 'Home') {
      console.log('Changing...', currentDirectory);
      set_FILES([]);
      set_FOLDERS([]);
      // FOR FOLDERS
      getFolders(currentDirectory)
        .then((folderPaths) => {
          set_FOLDERS(folderPaths);

          return folderPaths;
        })
        .catch((err) => log.error('Failed Retrieving Folders', err));

      // FOR FILES
      getFiles(currentDirectory)
        .then((filePaths) => {
          set_FILES(filePaths);

          dispatch(
            setMediaFileStack({
              mediaFilePaths: filePaths.map((val) =>
                path.normalize(currentDirectory + path.sep + val)
              ),
            })
          );
          return filePaths;
        })
        .catch((err) => log.error('Failed Retrieving Files', err));
    }
  }, [currentDirectory, dispatch]);

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
            <File
              id={nanoid()}
              filePath={filePath}
              currDir={currentDirectory}
              syncStatusInfo={syncStatusInfo}
            />
          </Col>
        );
      })}
    </Row>
  );
};

const DisplayArea = () => {
  const currentDirectoryInfo = useSelector(
    (state: store) => state.UserRepoData.currentDirectory
  );
  const SelectedRepo = currentDirectoryInfo.RepoID;
  const currentDirectory = currentDirectoryInfo.localLocation;

  const RepoInfo = useSelector((state: store) => state.UserRepoData.info);

  return (
    <div id="SelectionArea">
      {SelectedRepo &&
      currentDirectory !== 'Home' &&
      !!RepoInfo[SelectedRepo] ? (
        <Selected_Repository_Directory />
      ) : (
        <ALL_Repositories />
      )}
    </div>
  );
};

export default DisplayArea;
