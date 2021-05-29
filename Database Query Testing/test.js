/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/naming-convention */
const DB = require('better-sqlite3')('Testing/.usp/database.db');
const path = require('path');
const crypto = require('crypto');
const md5 = require('md5');

DB.function('combineStrings', (...arr) => arr.join(' '));

const getRemainingUploads = (RepoID, limit = -1) => {
  const file_data = DB.prepare(
    `SELECT name AS fileName, drive_id as driveID, folder_id FROM files LIMIT ?`
  ).all(limit);

  const stmt_folders = DB.prepare(
    `SELECT name AS folderName, path AS folderPath FROM folders WHERE folder_id = ?`
  );

  const response = file_data.map(({ fileName, driveID, folder_id }) => {
    const { folderPath } = stmt_folders.all(folder_id)[0];
    const filePath = path.join(folderPath, fileName);
    return { filePath, driveID };
  });

  return response;
};

const getNonCreatedFolder = (RepoID) => {
  const ROOT_FOLDER = DB.prepare(
    `SELECT path AS folderPath FROM folders WHERE folder_id = 1`
  ).all();

  const folder_data = DB.prepare(
    `SELECT path AS folderPath FROM folders WHERE drive_id IS NULL LIMIT -1 OFFSET 1`
  ).all();

  return { ROOT_FOLDER, folders_not_created };
};

const updateFolderDriveID = (RepoID, data) => {
  const stmt = DB.prepare(`UPDATE folders SET driveID = ? WHERE folder_id = ?`);

  const run = DB.transaction(() => {
    data.forEach(({ driveID, folder_id }) => {
      stmt.run(driveID, folder_id);
    });
  });

  // RUN THE TRANSACTION
  run();

  console.log('Updated Folder Data', { RepoID, data });
};

const updateFilesDriveID = (RepoID, data) => {
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

  console.log('Updated File Data Succesfully', { RepoID, data });
};

// updateFilesDriveID('adasd', {
//   driveID: 'AsdasdasdASd12e 122easd',
//   folder_id: 2,
//   fileName: '3.txt',
// });

const nanoid = () => {
  return crypto.randomBytes(16).toString('hex');
};

const addFolderRepoDB = (RepoID, data) => {
  const folder_id = nanoid();

  const stmt = DB.prepare(
    'INSERT or IGNORE INTO folders (folderName,folder_id,driveID,folderPath) VALUES (@folderName,@folder_id,@driveID,@folderPath)'
  );
  const run = DB.transaction(() => {
    stmt.run({
      driveID: data?.driveID,
      folder_id: nanoid(),
      folderName: path.basename(data.folderPath),
      folderPath: data.folderPath,
    });
  });

  // RUN THE TRANSACTION
  run();
};

// addFolderRepoDB('ASDASD', {
//   folderPath:
//     '/run/media/void/42E6C46EE6C4642F/MajorProject/LINUX_FVS_GIT_CLONE/Testing/Random',
//   driveID: '123123',
// });

const removeFolderRepoDB = (RepoID, data) => {
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
};

// removeFolderRepoDB('ASDASD', {
//   folderPath: 'D:\\MajorProject\\fhs_sql\\Testing\\asd22',
// });

const addFileRepoDB = (RepoID, data) => {
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
};

// addFileRepoDB('ASDASD', {
//   driveID: '123',
//   filePath: 'Testing\\FUCIMG GEY',
//   uploaded: 1,
//   folder_id: '66294dc7209e79c772cc71b270d663d2',
// });

const getFilePath = ({ RepoID, driveID }) => {
  const stmt = DB.prepare(
    'SELECT folders.folderPath, files.fileName from folders,files WHERE files.driveID = @driveID AND files.folder_id = folders.folder_id'
  );
  const data = stmt.get({
    driveID,
  });
  console.log(data);
  // RUN THE TRANSACTION
  return data;
};

// getFilePath({
//   RepoID: 'ASDASD',
//   driveID: '123',
// });

const renameFileNamefromDB = ({ RepoID, driveID, fileName }) => {
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

// renameFileNamefromDB({
//   RepoID: 'ASDASD',
//   driveID: '18STix_iGLczqbABGcVbkazRzwwURig0d',
//   fileName: 'sex22.doc',
// });

const renameFolderNamefromDB = ({
  RepoID,
  driveID,
  oldFolderPath,
  newFolderPath,
}) => {
  const stmt = DB.prepare(
    'UPDATE folders SET folderName = @folderName WHERE driveID = @driveID'
  );

  const localLocation = '/Testing';
  const regex = new RegExp(`^${oldFolderPath}`);

  DB.function('RENAME_ALL_PATHS', (folderPath) => {
    const newPath = folderPath.replace(regex, newFolderPath);

    return newPath;
  });

  DB.function('MD5', (folderPath) => {
    const newPath = folderPath.replace(regex, newFolderPath);
    const relativePath = newPath.substr(
      localLocation.lastIndexOf(path.sep) + 1
    );
    console.log(relativePath, md5(relativePath));
    return md5(relativePath);
  });

  const stmt2 = DB.prepare(
    "UPDATE folders SET folderPath = RENAME_ALL_PATHS(folderPath), folder_id = MD5(folderPath) WHERE folderPath LIKE @oldFolderPath || '%'"
  );

  console.table(
    DB.prepare(
      "UPDATE OR REPLACE folders SET folderPath = REPLACE(folderPath,@oldFolderPath,@newFolderPath), folder_id = MD5(folderPath) WHERE folderPath LIKE @oldFolderPath || '%'"
    ).run({
      oldFolderPath,
      newFolderPath,
    })
  );

  // const run = DB.transaction(() => {
  //   stmt.run({
  //     driveID,
  //     folderName: path.basename(newFolderPath),
  //   });

  //   stmt2.run({
  //     oldFolderPath,
  //   });
  // });

  // run();
};

// renameFolderNamefromDB({
//   RepoID: 'asdas',
//   driveID: '1bC2YZh6Chx8vDM8Csy2NxC6wUgoL70IU',
//   newFolderPath:
//     '/run/media/void/42E6C46EE6C4642F/MajorProject/LINUX_FVS_GIT_CLONE/Testing/oh rock on',
//   oldFolderPath:
//     '/run/media/void/42E6C46EE6C4642F/MajorProject/LINUX_FVS_GIT_CLONE/Testing/oh yes',
// });

console.log(
  DB.prepare(
    'SELECT files.fileName, files.driveID, files.folder_id, folders.folderPath, folders.driveID AS parentDriveID FROM files,folders WHERE files.folder_id = folders.folder_id AND files.deleted IS NULL AND files.downloaded IS NULL LIMIT ?'
  ).all(2)
);

console.log(
  DB.prepare(
    'SELECT folderPath, driveID, folderName FROM folders WHERE deleted = 1'
  ).all()
);
