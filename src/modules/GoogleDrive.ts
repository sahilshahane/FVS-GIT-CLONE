/* eslint-disable max-classes-per-file */
import log from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import {
  removeRepository,
  setRepositoryTrackingInfo,
  trackingInfo_,
} from '../Redux/UserRepositorySlicer';
import {
  addFileRepoDB,
  addFolderRepoDB,
  disconnectDB,
  getFilePathFromDB,
  getFolderPathFromDB,
  getNonCreatedFolder,
  getParentPathFromRepoDatabase,
  removeFileRepoDB,
  removeFolderRepoDB,
  renameFileNamefromDB,
  renameFolderNamefromDB,
  setRepoDownload,
} from './Database';
import { sendSchedulerTask, CCODES } from './get_AppData';
import ReduxStore from '../Redux/store';
import {
  updateDownloadingQueue,
  updateUploadingQueue,
} from '../Redux/SynchronizationSlicer';
import { removeRepositoryDialog } from '../Components/remove-Repository';
import filenamify from 'filenamify';
const TAG = 'GoogleDrive.ts > ';

type MimeTypes =
  | `application/vnd.google-apps.audio`
  | `application/vnd.google-apps.document`
  | `application/vnd.google-apps.drive-sdk`
  | `application/vnd.google-apps.drawing`
  | `application/vnd.google-apps.file`
  | `application/vnd.google-apps.folder`
  | `application/vnd.google-apps.form`
  | `application/vnd.google-apps.fusiontable`
  | `application/vnd.google-apps.map`
  | `application/vnd.google-apps.photo`
  | `application/vnd.google-apps.presentation`
  | `application/vnd.google-apps.script`
  | `application/vnd.google-apps.shortcut`
  | `application/vnd.google-apps.site`
  | `application/vnd.google-apps.spreadsheet`
  | `application/vnd.google-apps.unknown`
  | `application/vnd.google-apps.video`;

type DriveItemTypes =
  | `TYPE_UNSPECIFIED`
  | `MY_DRIVE_ROOT`
  | `SHARED_DRIVE_ROOT`
  | `STANDARD_FOLDER`;

type DriveItemReference = {
  name: string;
  title: string;
  driveFile: {
    type: DriveItemTypes;
  };
  driveFolder: {
    type: DriveItemTypes;
  };
};

type TargetReference = {
  teamDrive: {
    name: string;
    title: string;
  };

  // Union field object can be only one of the following:
  driveItem: DriveItemReference;
  drive: {
    name: string;
    title: string;
  };
};

type DriveChange = {
  name: string;
  mimeType: MimeTypes;
  parents: string;
  timestamp: number;
  actions: {
    create?: {
      new?: {
        originalObject: TargetReference;
      };
      upload?: {
        originalObject: TargetReference;
      };
      copy?: {
        originalObject: TargetReference;
      };
    };
    edit?: unknown;
    move?: {
      addedParents: TargetReference[];
      removedParents: TargetReference[];
    };
    rename?: {
      oldTitle: string;
      newTitle: string;
    };
    delete?: {
      type: `TYPE_UNSPECIFIED` | `TRASH` | `PERMANENT_DELETE`;
    };
    restore?: `UNTRASH` | `TYPE_UNSPECIFIED`;
    permissionChange?: unknown;
    comment?: unknown;
    dlpChange?: unknown;
    reference?: unknown;
    settingsChange?: unknown;
  };
};

interface PerformGDriveChangesIF {
  RepoID: string;
  changes: {
    [driveID: string]: DriveChange;
  };
  trackingInfo: trackingInfo_;
}

export const createRepoFoldersInDrive = (
  RepoID: string,
  RepoName: string,
  isFirstTime = false
) => {
  const folderData = getNonCreatedFolder(RepoID);

  if (folderData.folderData.length || !folderData.repoFolderData.driveID) {
    log.info(TAG, 'Creating Folders in Drive', { RepoID, folderData });

    folderData.repoFolderData.RepoName = RepoName;

    // SEND DATA TO SCHEDULER
    sendSchedulerTask({
      code: CCODES.CREATE_FOLDERS,
      data: {
        RepoID,
        ...folderData,
        isFirstTime,
      },
    });
  }
};

class RootFolderDeleted extends Error {
  constructor(message = '') {
    super(message); // (1)
    this.name = 'RootFolderDeleted'; // (2)
  }
}

class BasicChange {
  data: DriveChange;

  driveID: string;

  RepoID: string;

  parentPath: string;

  parentFolderID: string;

  isRootFolder: boolean;

  constructor(data: DriveChange, driveID: string, RepoID: string) {
    this.data = data;
    this.driveID = driveID;
    this.RepoID = RepoID;

    const parentID = this.data.parents;

    const {
      parentPath,
      parentFolderID,
      isRootFolder,
    } = getParentPathFromRepoDatabase({
      RepoID,
      parentID,
    });

    this.parentFolderID = parentFolderID;
    this.parentPath = parentPath;
    this.isRootFolder = isRootFolder;

    this.create = this.create.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.restore = this.restore.bind(this);
    this.rename = this.rename.bind(this);
    this.perform = this.perform.bind(this);
  }

  create = () => {};

  edit = () => {};

  delete = () => {};

  restore = () => {};

  rename = () => {};

  perform = () => {};

  sanitizeName = (name: string) => {
    return filenamify(name);
  };
}

class FolderChange extends BasicChange {
  folderPath: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID, RepoID);

    if (!this.parentPath) {
      console.log(this.getInfo());
    }

    const { folderPath } = getFolderPathFromDB({
      RepoID: this.RepoID,
      driveID: this.driveID,
    });

    if (!folderPath)
      this.folderPath = path.join(
        this.parentPath,
        this.sanitizeName(this.data.name)
      );
    else this.folderPath = folderPath;
  }

  create = () => {
    fs.ensureDirSync(this.folderPath);

    addFolderRepoDB(this.RepoID, {
      folderPath: this.folderPath,
      driveID: this.driveID,
      folderName: this.data.name,
    });
  };

  delete = () => {
    if (this.isRootFolder) {
      removeRepositoryDialog({ RepoID: this.RepoID });

      ReduxStore.dispatch(removeRepository(this.RepoID));
      disconnectDB(this.RepoID);
      fs.removeSync(this.folderPath);

      throw new RootFolderDeleted();
    } else {
      fs.removeSync(this.folderPath);
      removeFolderRepoDB(this.RepoID, {
        folderPath: this.folderPath,
        driveID: this.driveID,
      });
    }
  };

  restore = () => {
    this.create();
  };

  rename = () => {
    const {
      actions: { rename },
    } = this.data;

    if (rename?.newTitle) {
      const oldFolderPath = this.folderPath;

      const newFolderPath = path.resolve(
        this.folderPath,
        '..',
        this.sanitizeName(rename.newTitle)
      );

      renameFolderNamefromDB({
        RepoID: this.RepoID,
        driveID: this.driveID,
        folderName: rename.newTitle,
        oldFolderPath,
        newFolderPath,
      });

      fs.renameSync(oldFolderPath, newFolderPath);
    }
  };

  getInfo = () =>
    JSON.parse(
      JSON.stringify({ data: this.data, folderPath: this.folderPath })
    );

  perform = () => {
    const { actions } = this.data;

    if (actions?.delete) {
      log.warn(TAG, 'PERFORMING FOLDER DELETE OEPRATION', this.getInfo());

      this.delete();
    } else if (actions?.create?.new) {
      log.warn(TAG, 'PERFORMING FOLDER CREATE OEPRATION', this.getInfo());

      this.create();
    } else if (actions?.restore) {
      log.warn(TAG, 'PERFORMING FOLDER RESTORE OEPRATION', this.getInfo());

      this.restore();
    }

    if (actions?.rename) {
      log.warn(TAG, 'PERFORMING FOLDER RENAME OEPRATION', this.getInfo());

      this.rename();
    }
  };
}

class FileChange extends BasicChange {
  filePath: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID, RepoID);

    const { folderPath: parentFolderPath, fileName } = getFilePathFromDB({
      RepoID: this.RepoID,
      driveID: this.driveID,
    });

    if (!fileName)
      this.filePath = path.join(this.parentPath, this.sanitizeName(data.name));
    else this.filePath = path.join(this.parentPath, fileName);

    switch (this.data.mimeType) {
      case 'application/vnd.google-apps.document':
        this.filePath += '.docx';
        break;
    }
  }

  perform = () => {
    const { actions } = this.data;

    if (actions?.delete) {
      log.warn(TAG, 'PERFORMING FILE DELETE OEPRATION', this.getInfo());

      this.delete();
    } else if (actions?.create?.new) {
      log.warn(TAG, 'PERFORMING FILE CREATE OEPRATION', this.getInfo());

      this.create();
    } else if (actions?.restore) {
      log.warn(TAG, 'PERFORMING FILE RESTORE OEPRATION', this.getInfo());

      this.restore();
    }

    if (actions?.edit) {
      log.warn(TAG, 'PERFORMING FILE EDIT OEPRATION', this.getInfo());
      this.edit();
    }

    if (actions?.rename) {
      log.warn(TAG, 'PERFORMING FILE RENAME OEPRATION', this.getInfo());

      this.rename();
    }
  };

  getInfo = () =>
    JSON.parse(JSON.stringify({ data: this.data, filePath: this.filePath }));

  rename = () => {
    const {
      actions: { rename },
    } = this.data;

    if (rename) {
      const newFilePath = path.resolve(
        this.filePath,
        '..',
        this.sanitizeName(rename.newTitle)
      );

      renameFileNamefromDB({
        RepoID: this.RepoID,
        driveID: this.driveID,
        fileName: path.basename(newFilePath),
      });

      fs.renameSync(this.filePath, newFilePath);
    }
  };

  create = () => {
    fs.ensureFileSync(this.filePath);

    addFileRepoDB(this.RepoID, {
      driveID: this.driveID,
      folder_id: this.parentFolderID,
      filePath: this.filePath,
      uploaded: 1,
      downloaded: null,
      modified_time: this.data.timestamp,
    });
  };

  delete = () => {
    fs.removeSync(this.filePath);

    removeFileRepoDB(this.RepoID, {
      driveID: this.driveID,
      folder_id: this.parentFolderID,
    });
  };

  edit = () => {
    setRepoDownload(this.RepoID, {
      driveID: this.driveID,
      type: 'ADD',
      modified_time: this.data.timestamp,
    });
  };

  restore = () => {
    this.create();
    this.edit();
  };
}

const getChangeObject = (
  RepoID: string,
  driveID: string,
  data: DriveChange
) => {
  const { mimeType } = data;

  switch (mimeType) {
    case 'application/vnd.google-apps.folder':
      return new FolderChange(RepoID, driveID, data);
    default:
      return new FileChange(RepoID, driveID, data);
  }
};

const getSortedChanges = (changes: { [driveID: string]: DriveChange }) => {
  return Object.keys(changes).sort((chg1, chg2) => {
    const timestamp1 = changes[chg1].timestamp;
    const timestamp2 = changes[chg2].timestamp;
    return timestamp1 - timestamp2;
  });
};

export const performGDriveChanges = ({
  RepoID,
  changes,
  trackingInfo,
}: PerformGDriveChangesIF) => {
  const failedUpdates: { driveID: string; error: any }[] = [];

  getSortedChanges(changes).every((driveID) => {
    try {
      const ChangeObj = getChangeObject(RepoID, driveID, changes[driveID]);
      ChangeObj.perform();

      // UPDATE THE REPOSITORY TRACKING INFO
      ReduxStore.dispatch(
        setRepositoryTrackingInfo({
          RepoID,
          trackingInfo: {
            ...trackingInfo,
            lastChecked: ChangeObj.data.timestamp,
          },
        })
      );
    } catch (error) {
      failedUpdates.push({ driveID, error });
      if (error instanceof RootFolderDeleted) return false;
      log.error(TAG, 'Failed Performing Changes', error);
    }
    return true;
  });

  if (failedUpdates.length === 0) {
    const { UserRepoData } = ReduxStore.getState();

    // UPDATE THE UPLOADING QUEUE
    ReduxStore.dispatch(updateUploadingQueue(UserRepoData));

    // UPDATE THE DOWNLOADING QUEUE
    ReduxStore.dispatch(updateDownloadingQueue(UserRepoData));
  } else {
    log.error(
      TAG,
      'Not Updating Uploads and Downloads, Errors were found while performing offline changes',
      failedUpdates
    );
  }
};
