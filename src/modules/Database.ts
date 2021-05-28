/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */
import Sqlite3 from 'better-sqlite3';
import path from 'path';
import log from 'electron-log';
import { nanoid } from '@reduxjs/toolkit';
import Reduxstore from '../Redux/store';
import { DoingQueue } from '../Redux/SynchronizationSlicer';

const TAG = 'Database.ts > ';

const connect = (filePath: string) => {
  return new Sqlite3(filePath);
};

const DB_CONNECTIONS: {
  [RepoID: string]: Sqlite3.Database;
} = {};

export const InitializeDatabase = (RepoID: string) => {
  return getDB(RepoID);
};

export const disconnectDB = (RepoID: string) => {
  try {
    if (DB_CONNECTIONS[RepoID]) {
      DB_CONNECTIONS[RepoID].close();
      log.info(TAG, 'Disconnected from database', { RepoID });
    } else {
      log.warn(
        TAG,
        'Database connection does not exists, nothing to disconnect'
      );
    }
  } catch (error) {
    log.error(TAG, 'Failed to disconnect from database', { RepoID, error });
    return false;
  }
  return true;
};

const getDB = (RepoID: string | number) => {
  // IF DB EXSISTS IN DB_CONNECTIONS, just Return it
  if (DB_CONNECTIONS[RepoID]) return DB_CONNECTIONS[RepoID];

  const { UserRepoData } = Reduxstore.getState();
  const { localLocation } = UserRepoData.info[RepoID];
  const DB_FILE_PATH = path.join(localLocation, '.usp', 'database.db');
  try {
    const DB = connect(DB_FILE_PATH);

    // ADD IT to DB_CONNECTIONS
    DB_CONNECTIONS[RepoID] = DB;
    log.info(TAG, 'Connected to Database Successfully', { RepoID });
    return DB;
  } catch (error) {
    log.error(TAG, `Failed to connect to database`, { RepoID, error });
  }

  return false;
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

export const getRemainingDownloadsName = (RepoID: string | number) => {
  const DB = getDB(RepoID);

  // THIS STATEMENT RETURNS fileName, directoryName, parentPath
  // const stmt = DB.prepare(`SELECT name as fileName,
  //                         (SELECT name from folders WHERE folder_id = files.folder_id ) AS folderName,
  //                         (SELECT parentPath from folders WHERE folder_id = files.folder_id ) AS parentPath FROM files
  //                           WHERE uploaded IS NULL`);

  const response = DB.prepare(
    'SELECT fileName from files WHERE downloaded IS NULL'
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

export const getRemainingDownloads = (RepoID: string, limit = -1) => {
  const DB = getDB(RepoID);

  const file_data = DB.prepare(
    `SELECT fileName, driveID, folder_id FROM files WHERE downloaded IS NULL LIMIT ?`
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
    `SELECT folder_id, folderPath, driveID FROM folders ORDER BY ROWID ASC LIMIT 1`
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

type GetParentPathFromDatabase = {
  RepoID: string;
  parentID: string;
};

export const getParentPathFromRepoDatabase = ({
  RepoID,
  parentID,
}: GetParentPathFromDatabase) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'SELECT folderPath, folder_id FROM folders WHERE driveID = ?'
  );

  let response: {
    folderPath?: string;
    folder_id?: string;
    isRootFolder?: boolean;
  } = {
    ...stmt.get(parentID),
  };

  if (!response?.folderPath) {
    const { AppSettings, UserRepoData } = Reduxstore.getState();

    const rootFolderDriveID =
      AppSettings.cloudLoginStatus.googleDrive?.rootFolderDriveID;

    if (parentID === rootFolderDriveID) {
      const folderPath = path.normalize(
        UserRepoData.info[RepoID].localLocation + path.sep + '..'
      );

      response = {
        folderPath,
        isRootFolder: true,
      };
    }
  }

  return {
    parentPath: response.folderPath,
    parentFolderID: response.folder_id,
    isRootFolder: response.isRootFolder,
  };
};

type addFolderRepoDB_ = (
  RepoID: string,
  data: {
    folderPath: string;
    driveID?: string;
  }
) => void;

export const addFolderRepoDB: addFolderRepoDB_ = (RepoID, data) => {
  try {
    const DB = getDB(RepoID);

    const stmt = DB.prepare(
      'INSERT INTO folders (folderName,folder_id,driveID,folderPath) VALUES (@folderName,@folder_id,@driveID,@folderPath)'
    );
    const run = DB.transaction(() => {
      stmt.run({
        driveID: data?.driveID,
        folder_id: nanoid(32),
        folderName: path.basename(data.folderPath),
        folderPath: data.folderPath,
      });
    });

    // RUN THE TRANSACTION
    run();
    log.info(TAG, 'Added Folder Data Succesfully', { RepoID, data });
  } catch (errr) {
    log.error(TAG, 'FOLDER ALREADY EXISTS (this is normal)', {
      RepoID,
      data,
      errr,
    });
  }
};

type removeFolderRepoDB_ = (
  RepoID: string,
  data: {
    folderPath: string;
    driveID?: string;
  }
) => void;

export const removeFolderRepoDB: removeFolderRepoDB_ = (RepoID, data) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'DELETE FROM folders WHERE folderPath = @folderPath OR driveID IS NOT NULL AND driveID = @driveID'
  );

  const run = DB.transaction(() => {
    stmt.run({
      folderPath: data.folderPath,
      driveID: data.driveID,
    });
  });

  // RUN THE TRANSACTION
  run();
  log.info('Removed Folder Data Succesfully', { RepoID, data });
};

type addFileRepoDB_ = (
  RepoID: string,
  data: {
    folder_id: string;
    driveID: string;
    filePath: string;
    uploaded?: 1 | null;
    downloaded?: 1 | null;
    fileHash?: string;
    modified_time?: string;
  }
) => void;

export const addFileRepoDB: addFileRepoDB_ = (RepoID, data) => {
  try {
    const DB = getDB(RepoID);

    const stmt = DB.prepare(
      'INSERT INTO files (fileName,folder_id,driveID,uploaded,downloaded,fileHash,modified_time) VALUES (@fileName,@folder_id,@driveID,@uploaded,@downloaded,@fileHash,@modified_time)'
    );
    const run = DB.transaction(() => {
      stmt.run({
        driveID: data.driveID,
        folder_id: data.folder_id,
        fileName: path.basename(data.filePath),
        uploaded: data.uploaded,
        downloaded: data.downloaded,
        fileHash: data.fileHash,
        modified_time: data.modified_time,
      });
    });

    // RUN THE TRANSACTION
    run();
    log.info('Added File Data Succesfully', { RepoID, data });
  } catch (errr) {
    log.error('FOLDER ALREADY EXISTS', errr);
  }
};

type removeFileRepoDB_ = (
  RepoID: string,
  data: {
    folder_id: string;
    driveID: string;
  }
) => void;

export const removeFileRepoDB: removeFileRepoDB_ = (RepoID, data) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'DELETE FROM files WHERE driveID = @driveID AND folder_id = @folder_id'
  );

  const run = DB.transaction(() => {
    stmt.run({
      folder_id: data.folder_id,
      driveID: data.driveID,
    });
  });

  // RUN THE TRANSACTION
  run();
  log.info('Removed File Data Succesfully', { RepoID, data });
};

type setRepoDownload_ = (
  RepoID: string,
  data: {
    driveID: string;
    type: 'ADD' | 'COMPLETE';
  }
) => void;

export const setRepoDownload: setRepoDownload_ = (RepoID, data) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    `UPDATE files SET downloaded = @downloaded WHERE driveID = @driveID`
  );

  const run = DB.transaction(() => {
    const modifiedVal: {
      driveID: string;
      downloaded?: number | null;
    } = {
      driveID: data.driveID,
      downloaded: null,
    };

    if (data.type == 'COMPLETE') {
      modifiedVal.downloaded = 1;
    }

    stmt.run(modifiedVal);
  });

  // RUN THE TRANSACTION
  run();

  log.info('Updated File Data Succesfully', { RepoID, data });
};

export const getAllFilesWithPaths = (RepoID: String) => {
  const DB = getDB(RepoID);
  const response = DB.prepare(
    'SELECT files.fileName, files.folder_id, files.modified_time, files.driveID, files.uploaded, files.downloaded, files.deleted, files.fileHash, folders.folderPath FROM files INNER JOIN folders ON folders.folder_id = files.folder_id'
  ).all();
  return response;
};

export const getAllFiles = (RepoID: String) => {
  const DB = getDB(RepoID);
  const response = DB.prepare('SELECT * FROM files').all();
  return response;
};

export const getAllFolders = (RepoID: String) => {
  const DB = getDB(RepoID);
  const response = DB.prepare('SELECT * FROM folders').all();
  return response;
};
