/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/naming-convention */
const DB = require('better-sqlite3')('Testing/.usp/database.db');
const path = require('path');

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

updateFilesDriveID('adasd', {
  driveID: 'AsdasdasdASd12e 122easd',
  folder_id: 2,
  fileName: '3.txt',
});
