/* eslint-disable react/jsx-pascal-case */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { current, nanoid } from '@reduxjs/toolkit';
import { fdir as FDIR } from 'fdir';
import log from 'electron-log';
import path from 'path';
import { File, Folder, Repository } from './folder-area-ui';
import { store } from '../Redux/store';
import { setMediaFileStack } from '../Redux/MediaPlayerSlicer';
import {
  getAllFilesWithPaths,
  checkAllFilesSynced,
  getAllFolders,
  checkFilesSyncedOrNot,
} from '../modules/Database';

interface folderPathAndID {
  folderPath: string;
  folder_id: string;
  synced?: boolean;
}

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
              syncStatus={checkAllFilesSynced(repoID)}
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
  let currentRepoID = '';
  Object.keys(repositoryData).every((RepoID) => {
    if (currentDirectory?.includes(repositoryData[RepoID].localLocation)) {
      currentRepoID = RepoID;
      return false;
    }
    return true;
  });

  if (FILES.length !== 0 && currentDirectory) {
    getAllFilesWithPaths(currentRepoID).forEach((file) => {
      const absPath = path.join(currentDirectory, file.fileName);
      syncStatusInfo[absPath] = file.uploaded;
    });
  }

  const allFolders: folderPathAndID[] = getAllFolders(currentRepoID);
  let directChildFolders: folderPathAndID[] = [];

  const checkFolderSynced = (folder: folderPathAndID): boolean => {
    const filesSynced = checkFilesSyncedOrNot(currentRepoID, folder.folder_id);
    if (!filesSynced) {
      return false;
    }

    const childFolders = allFolders.filter((child) => {
      if (
        child.folderPath.includes(folder.folderPath) &&
        child.folderPath !== folder.folderPath &&
        child.folderPath
          .substr(folder.folderPath.length + 1)
          .indexOf(path.sep) === -1 &&
        path.dirname(child.folderPath) === folder.folderPath
      ) {
        return true;
      }
      return false;
    });

    let synced = true;
    childFolders.every((childFolder) => {
      synced = checkFolderSynced(childFolder);
      if (!synced) {
        synced = false;
        return false;
      }
      return true;
    });
    return synced;
  };

  if (FOLDERS.length !== 0) {
    directChildFolders = allFolders.filter((folder) => {
      const { folderPath } = folder;
      // I know the below condition doesn't explain what this condition does, sorry for that
      // This basically finds the direct children of a directory. Children as in the folders, i.e. the direct folders
      // eg. currentDirectory -> a/b/c/d
      //     rest of the dirs ->a/b/c/d - a/b/c/d/e - a/b/c/d/e/f/g - a/b/c/d/i - a/b/c/d/j/k
      //     So this if will will only be true for -> a/b/c/d/e and a/b/c/d/i
      //     Cuz they are the direct first children folders and not some grandchildren folders.
      // Here the folderPath represents one path out of all the folder paths in that repo.
      if (
        currentDirectory &&
        folderPath.includes(currentDirectory) &&
        folderPath !== currentDirectory &&
        folderPath.substr(currentDirectory.length + 1).indexOf(path.sep) ===
          -1 &&
        path.dirname(folderPath) === currentDirectory
      ) {
        return true;
      }
      return false;
    });
    // console.log(directChildFolders);
    directChildFolders.forEach((childFolder) => {
      const result: boolean = checkFolderSynced(childFolder);
      childFolder.synced = result;
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
      {directChildFolders.map((childFolder) => {
        return (
          <Col
            xs={{ span: 24 }}
            sm={{ span: 8 }}
            md={{ span: 6 }}
            key={nanoid()}
          >
            <Folder
              id={nanoid()}
              folderPath={childFolder.folderPath}
              syncStatus={childFolder.synced}
            />
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
