/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import Sqlite3 from 'better-sqlite3';
import path from 'path';
import log from 'electron-log';
import Reduxstore from '../Redux/store';
import { DoingQueue } from '../Redux/SynchronizationSlicer';

const connect = (filePath: string) => {
  return new Sqlite3(filePath);
};

const DB_CONNECTIONS: {
  [RepoID: string]: Sqlite3.Database;
} = {};

const getDB = (RepoID: string | number) => {
  // IF DB EXSISTS IN DB_CONNECTIONS, just Return it
  if (DB_CONNECTIONS[RepoID]) return DB_CONNECTIONS[RepoID];

  const { UserRepoData } = Reduxstore.getState();

  const { localLocation } = UserRepoData.info[RepoID];
  const DB_FILE_PATH = path.join(localLocation, '.usp', 'database.db');
  const DB = connect(DB_FILE_PATH);

  // ADD IT to DB_CONNECTIONS
  DB_CONNECTIONS[RepoID] = DB;

  return DB;
};

export const getRemainingUploadsName = (RepoID: string | number) => {
  const DB = getDB(RepoID);

  // THIS STATEMENT RETURNS fileName, directoryName, parentPath
  // const stmt = DB.prepare(`SELECT name as fileName,
  //                         (SELECT name from folders WHERE folder_id = files.folder_id ) AS folderName,
  //                         (SELECT parentPath from folders WHERE folder_id = files.folder_id ) AS parentPath FROM files
  //                           WHERE uploaded IS NULL`);

  const response = DB.prepare(
    'SELECT fileName from files WHERE uploaded IS NULL'
  ).all();

  return response;
};

export const getFinishedUploadsName = (RepoID: number) => {
  const DB = getDB(RepoID);

  // THIS STATEMENT RETURNS fileName, directoryName, parentPath
  // const stmt = DB.prepare(`SELECT name as fileName,
  //                         (SELECT name from folders WHERE folder_id = files.folder_id ) AS folderName,
  //                         (SELECT parentPath from folders WHERE folder_id = files.folder_id ) AS parentPath FROM files
  //                           WHERE uploaded IS NULL`);

  const response = DB.prepare(
    'SELECT fileName from files WHERE uploaded IS NOT NULL'
  ).all();

  return response;
};

export const getRemainingUploads = (RepoID: string, limit = -1) => {
  const DB = getDB(RepoID);

  const file_data = DB.prepare(
    `SELECT fileName, driveID, folder_id FROM files WHERE uploaded IS NULL LIMIT ?`
  ).all(limit);

  const stmt_folders = DB.prepare(
    `SELECT folderName, folderPath, driveID AS parentDriveID FROM folders WHERE folder_id = ?`
  );

  const response: Array<DoingQueue> = file_data.map(
    ({ fileName, driveID, folder_id }) => {
      const { folderPath, parentDriveID } = stmt_folders.all(folder_id)[0];
      const filePath = path.join(folderPath, fileName);
      return { RepoID, fileName, filePath, driveID, parentDriveID, folder_id };
    }
  );

  return response;
};

export const getNonCreatedFolder = (RepoID: string) => {
  const DB = getDB(RepoID);

  const repoFolderData = DB.prepare(
    `SELECT folder_id, folderPath, driveID FROM folders WHERE folder_id = 1`
  ).all()[0];

  const folderData = DB.prepare(
    `SELECT folderPath, folder_id FROM folders WHERE driveID IS NULL LIMIT -1 OFFSET 1`
  ).all();

  return { repoFolderData, folderData };
};

type updateFolderDriveID_ = (
  RepoID: string,
  data: {
    folder_id: number;
    driveID: string;
  }
) => Promise<void>;

export const updateFolderDriveID: updateFolderDriveID_ = async (
  RepoID,
  data
) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    `UPDATE folders SET driveID = @driveID WHERE folder_id = @folder_id`
  );

  const run = DB.transaction(() => {
    stmt.run(data);
  });

  // RUN THE TRANSACTION
  run();

  log.info('Updated Folder Data Succesfully', { RepoID, data });
};

type updateFilesDriveID_ = (
  RepoID: number | string,
  data: {
    folder_id: number;
    driveID: string;
    fileName: string;
  }
) => Promise<void>;

export const updateFilesDriveID: updateFilesDriveID_ = async (RepoID, data) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    `UPDATE files SET driveID = @driveID, uploaded = 1 WHERE folder_id = @folder_id AND fileName = @fileName`
  );

  const run = DB.transaction(() => {
    const modifiedVal = {
      driveID: data.driveID,
      folder_id: data.folder_id,
      fileName: data.fileName,
    };
    stmt.run(modifiedVal);
  });

  // RUN THE TRANSACTION
  run();

  log.info('Updated File Data Succesfully', { RepoID, data });
};

export const getResults = async (
  RepoID: number | string,
  SearchText: string,
  IgnrPathString: string
) => {
  const DB = getDB(RepoID);

  const searchedFolders = DB.prepare(
    `SELECT folderName, folderPath as path FROM folders WHERE folderName LIKE '%${SearchText}%' ${IgnrPathString}`
  ).all();

  const searchedFiles = DB.prepare(
    `SELECT fileName, (SELECT folderPath from folders WHERE folders.folder_id = files.folder_id ) AS path FROM files WHERE fileName LIKE '%${SearchText}%'`
  ).all();

  return {
    files: searchedFiles,
    folders: searchedFolders,
  };
};

// export const getFinishedUploadsName = (RepoID: string | number) => {
//   const DB = getDB(RepoID);

//   // THIS STATEMENT RETURNS fileName, directoryName, parentPath
//   const stmt = DB.prepare(`SELECT name as fileName,
//                           (SELECT name from folders WHERE folder_id = files.folder_id ) AS folderName,
//                           (SELECT parentPath from folders WHERE folder_id = files.folder_id ) AS parentPath FROM files
//                             WHERE uploaded IS NULL`);

//   const response = stmt.all();

//   return response;
// };
