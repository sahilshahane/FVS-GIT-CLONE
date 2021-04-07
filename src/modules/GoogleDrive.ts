/* eslint-disable max-classes-per-file */
import log from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import {
  setRepositoryTrackingInfo,
  trackingInfo_,
} from '../Redux/UserRepositorySlicer';
import {
  addFileRepoDB,
  addFolderRepoDB,
  getNonCreatedFolder,
  getParentPathFromRepoDatabase,
  removeFileRepoDB,
  removeFolderRepoDB,
  setRepoDownload,
} from './Database';
import { sendSchedulerTask, CCODES } from './get_AppData';
import ReduxStore from '../Redux/store';

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
  timestamp: string;
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

export const checkGDriveChanges = (
  RepoID: string,
  trackingInfo: trackingInfo_
) => {
  sendSchedulerTask({
    code: CCODES.CHECK_CHANGES,
    data: {
      RepoID,
      trackingInfo,
    },
  });
};

export const createRepoFoldersInDrive = (
  RepoID: string,
  RepoName: string,
  isFirstTime = false
) => {
  const folderData = getNonCreatedFolder(RepoID);
  console.log(folderData);
  if (folderData.folderData.length) {
    log.info('Creating Folders in Drive', { RepoID, folderData });

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

class BasicChange {
  data: DriveChange;

  driveID: string;

  RepoID: string;

  parentPath: string;

  parentFolderID: string;

  constructor(data: DriveChange, driveID: string, RepoID: string) {
    this.data = data;
    this.driveID = driveID;
    this.RepoID = RepoID;

    const parentID = this.data.parents;

    const { parentPath, parentFolderID } = getParentPathFromRepoDatabase({
      RepoID,
      parentID,
    });

    this.parentFolderID = parentFolderID;
    this.parentPath = parentPath;

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
}

class FolderChange extends BasicChange {
  folderPath: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID, RepoID);

    this.folderPath = path.join(this.parentPath, this.data.name);
  }

  create = () => {
    if (!fs.existsSync(this.folderPath)) fs.mkdirSync(this.folderPath);

    addFolderRepoDB(this.RepoID, {
      folderPath: this.folderPath,
      driveID: this.driveID,
    });
  };

  delete = () => {
    if (fs.existsSync(this.folderPath))
      fs.rmSync(this.folderPath, { recursive: true, force: true });

    removeFolderRepoDB(this.RepoID, {
      folderPath: this.folderPath,
      driveID: this.driveID,
    });
  };

  restore = () => {
    this.create();
  };

  perform = () => {
    try {
      const { actions } = this.data;

      if (actions?.delete) this.delete();
      else if (actions?.create) this.create();
      else if (actions?.restore) this.restore();
    } catch (error) {
      log.error('Error While Applying Changes Offline', error, {
        data: this.data,
      });

      return false;
    }
    return true;
  };
}

class FileChange extends BasicChange {
  filePath: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID, RepoID);

    this.filePath = path.join(this.parentPath, data.name);
  }

  perform = () => {
    try {
      const { actions } = this.data;

      if (actions?.delete) this.delete();
      else if (actions?.create?.new) this.create();
      else if (actions?.restore) this.restore();

      if (actions?.edit) this.edit();
    } catch (error) {
      log.error('Error While Applying Changes Offline', error, {
        data: this.data,
      });

      return false;
    }
    return true;
  };

  create = () => {
    if (!fs.existsSync(this.filePath)) fs.createFileSync(this.filePath);

    addFileRepoDB(this.RepoID, {
      driveID: this.driveID,
      folder_id: this.parentFolderID,
      filePath: this.filePath,
      uploaded: 1,
      downloaded: null,
    });
  };

  delete = () => {
    fs.rmSync(this.filePath, { force: true });

    removeFileRepoDB(this.RepoID, {
      driveID: this.driveID,
      folder_id: this.parentFolderID,
    });
  };

  edit = () => {
    // setRepoDownload(this.RepoID, {
    //   driveID: this.driveID,
    //   type: 'ADD',
    //   parentPath: this.parentPath,
    //   fileName: this.data.name,
    // });
  };

  restore = () => {
    this.create();
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

export const performGDriveChanges = ({
  RepoID,
  changes,
  trackingInfo,
}: PerformGDriveChangesIF) => {
  Object.keys(changes)
    .sort((PREVdriveID, NEXTdriveID) => {
      const PREVactivityTimestamp = changes[PREVdriveID].timestamp;
      const NEXTactivityTimestamp = changes[NEXTdriveID].timestamp;

      return new Date(PREVactivityTimestamp) - new Date(NEXTactivityTimestamp);
    })
    .forEach((driveID) => {
      console.warn(
        'PERFORMING CHANGE',
        JSON.parse(JSON.stringify(changes[driveID]))
      );
      const ChangeObj = getChangeObject(RepoID, driveID, changes[driveID]);
      const isChangeSuccessful = ChangeObj.perform();
    });

  // UPDATE THE REPOSITORY TRACKING INFO
  ReduxStore.dispatch(setRepositoryTrackingInfo({ RepoID, trackingInfo }));
};
