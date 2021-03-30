/* eslint-disable max-classes-per-file */
import log from 'electron-log';
import fs from 'fs-extra';
import path from 'path';
import {
  setRepositoryTrackingInfo,
  trackingInfo_,
} from '../Redux/UserRepositorySlicer';
import { getNonCreatedFolder, getParentPathFromRepoDatabase } from './Database';
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

type SupportedMimeTypes = {
  FOLDER: MimeTypes;
};

const supportedMimeTypes: SupportedMimeTypes = {
  FOLDER: 'application/vnd.google-apps.folder',
};

const createFolderOffline = (Path: string) => {
  const folderPath = getCrossPlatformPath(Path);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

const createFileOffline = (Path: string) => {
  const filePath = getCrossPlatformPath(Path);

  if (!fs.existsSync(filePath)) {
    fs.closeSync(fs.openSync(filePath, 'w'));
  }
};

const PerformCreateAction = (
  mimeType: MimeTypes,
  Path: string,
  data: DriveChange
) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  switch (mimeType) {
    case supportedMimeTypes.FOLDER:
      createFolderOffline(data.name);
      break;
    default:
      log.info(`Unknown MimeType`);
  }
};

class BasicChange {
  data: DriveChange;

  driveID: string;

  constructor(data: DriveChange, driveID: string) {
    this.data = data;
    this.driveID = driveID;
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
  ParentPath: string;

  folderPath: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID);
    const { parents } = this.data;

    // GET THE PATH
    this.ParentPath = getParentPathFromRepoDatabase({
      RepoID,
      parentID: parents,
    });

    this.folderPath = path.join(this.ParentPath, this.data.name);

    this.create = this.create.bind(this);
    this.perform = this.perform.bind(this);
  }

  create = () => {
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath);
    }
  };

  delete = () => {
    fs.rmSync(this.folderPath, { recursive: true, force: true });
  };

  perform = () => {
    try {
      const { actions } = this.data;

      if (actions.delete) this.delete();
      else if (actions.create) this.create();
      else if (actions.restore) this.create();
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
  Path: string;

  constructor(RepoID: string, driveID: string, data: DriveChange) {
    super(data, driveID);

    const { parents } = this.data;
    this.Path = getParentPathFromRepoDatabase({
      RepoID,
      parentID: parents,
    });
  }
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
  Object.keys(changes).forEach((driveID) => {
    const ChangeObj = getChangeObject(RepoID, driveID, changes[driveID]);
    const result = ChangeObj.perform();

    if (result) {
      // UPDATE THE DATABASE FOR THAT SPECIFIC FILE, STILL WORKING ON IT

      ReduxStore.dispatch(setRepositoryTrackingInfo({ RepoID, trackingInfo }));
    }
  });
};
