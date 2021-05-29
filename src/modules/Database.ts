/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/prefer-default-export */

import Sqlite3, { Statement } from 'better-sqlite3';
import path from 'path';
import log from 'electron-log';
import Reduxstore from '../Redux/store';
import { DoingQueue } from '../Redux/SynchronizationSlicer';
import md5 from 'md5';

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
      delete DB_CONNECTIONS[RepoID];
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

export const disconnectDB_all = () => {
  Object.keys(DB_CONNECTIONS).forEach((RepoID) => {
    disconnectDB(RepoID);
  });
};

const getDB = (RepoID: string | number) => {
  // IF DB EXSISTS IN DB_CONNECTIONS, just Return it
  if (DB_CONNECTIONS[RepoID]) return DB_CONNECTIONS[RepoID];

  const { UserRepoData } = Reduxstore.getState();
  const { localLocation } = UserRepoData.info[RepoID];
  const DB_FILE_PATH = path.join(localLocation, '.usp', 'database.db');

  const DB = connect(DB_FILE_PATH);

  // ADD IT to DB_CONNECTIONS
  DB_CONNECTIONS[RepoID] = DB;
  log.info(TAG, 'Connected to Database Successfully', { RepoID });
  return DB;
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
export type getRemainingQueue_ = (
  RepoID: string,
  limit?: number
) => DoingQueue[];

export const getRemainingUploads: getRemainingQueue_ = (
  RepoID: string,
  limit = -1
) => {
  const DB = getDB(RepoID);

  const file_data = DB.prepare(
    `SELECT files.fileName, files.driveID, files.folder_id, folders.folderPath, folders.driveID AS parentDriveID FROM files,folders WHERE files.folder_id = folders.folder_id AND files.deleted IS NULL AND files.uploaded IS NULL LIMIT ?`
  ).all(limit);

  const response: Array<DoingQueue> = file_data.map(
    ({ fileName, driveID, folder_id, folderPath, parentDriveID }) => {
      const filePath = path.resolve(folderPath, fileName);
      return { RepoID, fileName, filePath, driveID, parentDriveID, folder_id };
    }
  );

  return response;
};

export const getRemainingDownloads: getRemainingQueue_ = (
  RepoID,
  limit = -1
) => {
  const DB = getDB(RepoID);

  const file_data = DB.prepare(
    'SELECT files.fileName, files.driveID, files.folder_id, folders.folderPath, folders.driveID AS parentDriveID FROM files,folders WHERE files.folder_id = folders.folder_id AND files.deleted IS NULL AND files.downloaded IS NULL LIMIT ?'
  ).all(limit);

  const response: Array<DoingQueue> = file_data.map(
    ({ fileName, driveID, folder_id, folderPath, parentDriveID }) => {
      const filePath = path.resolve(folderPath, fileName);
      return { RepoID, fileName, filePath, driveID, parentDriveID, folder_id };
    }
  );

  return response;
};

interface DeletingQueue {
  files: DoingQueue[];
  folders: Array<{
    folderPath: string;
    driveID: string;
    folderName: string;
  }>;
}

export const getRemainingDeletes = (RepoID: string) => {
  const DB = getDB(RepoID);

  const file_data = DB.prepare(
    'SELECT files.fileName, files.driveID, files.folder_id, folders.folderPath, folders.driveID AS parentDriveID FROM files,folders WHERE files.folder_id = folders.folder_id AND files.deleted = 1'
  ).all();

  const folder_data = DB.prepare(
    'SELECT folderPath, driveID, folderName FROM folders WHERE deleted = 1'
  ).all();

  const file_response: Array<DoingQueue> = file_data.map(
    ({ fileName, driveID, folder_id, folderPath, parentDriveID }) => {
      const filePath = path.join(folderPath, fileName);
      return { RepoID, fileName, filePath, driveID, parentDriveID, folder_id };
    }
  );

  const response: DeletingQueue = {
    files: file_response,
    folders: folder_data,
  };

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
    folderPath: string;
    folder_id: string;
    isRootFolder: boolean;
  } = {
    ...stmt.get(parentID),
    isRootFolder: false,
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
        ...response,
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
    folderName: string;
    folderPath: string;
    driveID?: string;
  }
) => void;

export const addFolderRepoDB: addFolderRepoDB_ = (RepoID, data) => {
  const DB = getDB(RepoID);
  const { UserRepoData } = Reduxstore.getState();
  const { localLocation } = UserRepoData.info[RepoID];

  const stmt = DB.prepare(
    'INSERT or IGNORE INTO folders (folderName,folder_id,driveID,folderPath) VALUES (@folderName,@folder_id,@driveID,@folderPath)'
  );

  const relativePath = data.folderPath.substr(
    localLocation.lastIndexOf(path.sep) + 1
  );

  const run = DB.transaction(() => {
    stmt.run({
      driveID: data?.driveID,
      folder_id: md5(relativePath),
      folderName: data.folderName,
      folderPath: data.folderPath,
    });
  });

  // RUN THE TRANSACTION
  run();
  log.info(TAG, 'Added Folder Data Succesfully', { RepoID, data });
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
    modified_time: number;
  }
) => void;

export const addFileRepoDB: addFileRepoDB_ = (RepoID, data) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'INSERT or IGNORE INTO files (fileName,folder_id,driveID,uploaded,downloaded,fileHash,modified_time) VALUES (@fileName,@folder_id,@driveID,@uploaded,@downloaded,@fileHash,@modified_time)'
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
    'UPDATE files SET deleted = 2 WHERE driveID = @driveID AND folder_id = @folder_id'
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
    modified_time?: number;
    type: 'ADD' | 'COMPLETE';
  }
) => void;

export const setRepoDownload: setRepoDownload_ = (RepoID, data) => {
  const DB = getDB(RepoID);

  let run = () => {};

  if (data.type === 'ADD') {
    const stmt = DB.prepare(
      `UPDATE files SET downloaded = @downloaded WHERE driveID = @driveID AND modified_time >= @modified_time`
    );

    run = DB.transaction(() => {
      stmt.run({
        driveID: data.driveID,
        modified_time: data.modified_time,
        downloaded: null,
      });
    });
  } else {
    const stmt = DB.prepare(
      `UPDATE files SET downloaded = @downloaded WHERE driveID = @driveID`
    );

    run = DB.transaction(() => {
      stmt.run({
        driveID: data.driveID,
        downloaded: 1,
      });
    });
  }

  // RUN THE TRANSACTION
  run();

  log.info('Updated File Data Succesfully', { RepoID, data });
};

type getFilePath_ = (data: {
  RepoID: string;
  driveID: string;
}) => { folderPath: string; fileName: string };

export const getFilePathFromDB: getFilePath_ = ({ RepoID, driveID }) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'SELECT folders.folderPath, files.fileName from folders,files WHERE files.driveID = @driveID AND files.folder_id = folders.folder_id'
  );

  const data = stmt.get({
    driveID,
  });

  // RUN THE TRANSACTION
  return data;
};

type getFolderPath_ = (data: {
  RepoID: string;
  driveID: string;
}) => { folderName: string; folderPath: string };

export const getFolderPathFromDB: getFolderPath_ = ({ RepoID, driveID }) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'SELECT folderName,folderPath from folders WHERE driveID = @driveID'
  );

  const data = stmt.get({
    driveID,
  });

  // RUN THE TRANSACTION
  return data;
};

type renameFileNamefromDB_ = (data: {
  RepoID: string;
  driveID: string;
  fileName: string;
}) => void;

export const renameFileNamefromDB: renameFileNamefromDB_ = ({
  RepoID,
  driveID,
  fileName,
}) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'UPDATE files SET fileName = @fileName WHERE driveID = @driveID'
  );

  const run = DB.transaction(() => {
    stmt.run({
      driveID,
      fileName,
    });
  });

  run();
};

type renameFolderNamefromDB_ = (data: {
  RepoID: string;
  driveID: string;
  folderName: string;
  oldFolderPath: string;
  newFolderPath: string;
}) => void;

export const renameFolderNamefromDB: renameFolderNamefromDB_ = ({
  RepoID,
  driveID,
  folderName,
  oldFolderPath,
  newFolderPath,
}) => {
  const DB = getDB(RepoID);

  const stmt = DB.prepare(
    'UPDATE folders SET folderName = @folderName WHERE driveID = @driveID'
  );

  const { UserRepoData } = Reduxstore.getState();
  const { localLocation } = UserRepoData.info[RepoID];

  const regex = new RegExp(`^${oldFolderPath}`);

  DB.function('MD5', (folderPath: string) => {
    const newPath = folderPath.replace(regex, newFolderPath);
    const relativePath = newPath.substr(
      localLocation.lastIndexOf(path.sep) + 1
    );
    return md5(relativePath);
  });

  const stmt2 = DB.prepare(
    "UPDATE OR REPLACE folders SET folderPath = REPLACE(folderPath,@oldFolderPath,@newFolderPath), folder_id = MD5(folderPath) WHERE folderPath LIKE @oldFolderPath || '%'"
  );

  const run = DB.transaction(() => {
    stmt.run({
      driveID,
      folderName,
    });

    stmt2.run({
      oldFolderPath,
      newFolderPath,
    });
  });

  run();
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
