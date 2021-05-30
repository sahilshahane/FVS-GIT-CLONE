import { RepositoryInfo, trackingInfo_ } from '../Redux/UserRepositorySlicer';
import { CCODES, sendSchedulerTask } from './get_AppData';
import Reduxstore from '../Redux/store';

interface operations_ {
  [RepoID: string]: {
    localChanges: boolean;
    onlineChanges: boolean;
  };
}

let operations: operations_ = {};

export class SyncInProgress extends Error {}

export const checkLocalChanges = (RepoID: string, repoData: RepositoryInfo) => {
  if (!operations[RepoID]) operations[RepoID] = {};

  if (!operations[RepoID].localChanges && !operations[RepoID].onlineChanges) {
    console.warn(`Syncing Repository`, repoData);

    sendSchedulerTask({
      code: CCODES.CHECK_LOCAL_CHANGES,
      data: {
        RepoID,
        path: repoData.localLocation,
      },
    });

    operations[RepoID] = {
      ...operations[RepoID],
      localChanges: true,
    };
  } else {
    throw new SyncInProgress();
  }
};

export const checkGDriveChanges = (
  RepoID: string,
  repoData: RepositoryInfo
) => {
  if (!operations[RepoID]) operations[RepoID] = {};

  if (!operations[RepoID].onlineChanges && !operations[RepoID].localChanges) {
    sendSchedulerTask({
      code: CCODES.CHECK_CHANGES,
      data: {
        RepoID,
        trackingInfo: repoData.trackingInfo,
      },
    });

    operations[RepoID] = {
      ...operations[RepoID],
      onlineChanges: true,
    };
  }
};

type setCheckingOperationChanges_ = {
  RepoID: string;
  type: 'localChanges' | 'onlineChanges';
  value: boolean;
};

export const setCheckingOperationChanges = ({
  RepoID,
  type,
  value,
}: setCheckingOperationChanges_) => {
  if (!operations[RepoID]) operations[RepoID] = {};

  operations[RepoID][type] = value;
};

export const scheduleSync = (RepoID: string) => {
  try {
    setTimeout(() => {
      const {
        UserRepoData: { info: Repositories },
      } = Reduxstore.getState();
      checkLocalChanges(RepoID, Repositories[RepoID]);
    }, 1000 * 60 * 60);
  } catch (e) {
    scheduleSync(RepoID);
  }
};
