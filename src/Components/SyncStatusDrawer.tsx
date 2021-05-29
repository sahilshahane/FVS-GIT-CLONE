/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer, List, Collapse } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  PauseCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import log from 'electron-log';
import {
  closeSyncDrawer,
  DoingQueue,
  FinishedQueueInterface,
} from '../Redux/SynchronizationSlicer';
import { store } from '../Redux/store';
import {
  getRemainingDownloads,
  getRemainingQueue_,
  getRemainingUploads,
} from '../modules/Database';

// ////////////////////////////////////////////////////////////////////////////////////
const getStatusIcon = (
  status: 'WAITING' | 'RUNNING' | 'PAUSED' | 'FAILED' | 'FINISHED' | any
) => {
  const iconSize = '1.2rem';
  // eslint-disable-next-line default-case
  switch (status) {
    case 'RUNNING':
      return <LoadingOutlined style={{ fontSize: iconSize, color: 'red' }} />;
    case 'PAUSED':
      return (
        <PauseCircleTwoTone
          twoToneColor="yellow"
          style={{ fontSize: iconSize }}
        />
      );
    case 'FINISHED':
      return (
        <CheckCircleTwoTone
          twoToneColor="green"
          style={{ fontSize: iconSize }}
        />
      );
    case 'FAILED':
      return (
        <CloseCircleTwoTone twoToneColor="red" style={{ fontSize: iconSize }} />
      );
    default:
      return <LoadingOutlined style={{ fontSize: iconSize }} />;
  }
};

const shouldShowRepo = (
  DoingQueue_: Array<DoingQueue>,
  WaitingQueue: Array<DoingQueue>,
  FinishedQueue: FinishedQueueInterface,
  RepoID: string
) => {
  return !!(
    DoingQueue_.find((val) => val.RepoID === RepoID) ||
    WaitingQueue.length ||
    FinishedQueue[RepoID]?.length
  );
};

interface BaseDrawer_ {
  doingQueue: DoingQueue[];
  finishedQueue: FinishedQueueInterface;
  remainingQueueFunction: getRemainingQueue_;
}

const BaseDrawer: FC<BaseDrawer_> = ({
  doingQueue,
  finishedQueue,
  remainingQueueFunction,
}) => {
  const UserRepos = useSelector((state: store) => state.UserRepoData.info);

  return (
    <Collapse bordered={false} style={{ margin: 0, padding: 0, width: 300 }}>
      {Object.keys(UserRepos).map((RepoID) => {
        const waitingQueue = remainingQueueFunction(RepoID).filter((val1) => {
          return !(
            doingQueue.find((val) => val.filePath === val1.filePath) ||
            finishedQueue[RepoID]?.find((val) => {
              return val.filePath === val1.filePath;
            })
          );
        });

        const shouldShow = shouldShowRepo(
          doingQueue,
          waitingQueue,
          finishedQueue,
          RepoID
        );

        if (shouldShow)
          return (
            <Collapse.Panel
              header={UserRepos[RepoID].displayName}
              key={nanoid()}
            >
              {doingQueue.length ? (
                <List
                  dataSource={doingQueue}
                  renderItem={(data) =>
                    !(data.RepoID === RepoID) ? null : (
                      <List.Item.Meta
                        avatar={getStatusIcon('RUNNING')}
                        title={data.fileName}
                      />
                    )
                  }
                />
              ) : null}

              {/* <Divider /> */}
              {waitingQueue.length ? (
                <List
                  dataSource={waitingQueue}
                  renderItem={({ fileName }) => (
                    <List.Item.Meta
                      avatar={getStatusIcon('WAITING')}
                      title={fileName}
                    />
                  )}
                />
              ) : null}
              {/* <Divider /> */}
              {(finishedQueue[RepoID] && finishedQueue[RepoID].length && (
                <List
                  dataSource={finishedQueue[RepoID]}
                  renderItem={(data) => (
                    <List.Item.Meta
                      avatar={getStatusIcon('FINISHED')}
                      title={data.fileName}
                    />
                  )}
                />
              )) ||
                null}
            </Collapse.Panel>
          );

        return null;
      })}
    </Collapse>
  );
};

const DownloadsDrawer = () => {
  const downloadingQueue = useSelector(
    (state: store) => state.Sync.downloadingQueue
  );

  const downloadFinishedQueue = useSelector(
    (state: store) => state.Sync.downloadFinishedQueue
  );

  return (
    <BaseDrawer
      doingQueue={downloadingQueue}
      finishedQueue={downloadFinishedQueue}
      remainingQueueFunction={getRemainingDownloads}
    />
  );
};

const UploadsDrawer = () => {
  const uploadingQueue = useSelector(
    (state: store) => state.Sync.uploadingQueue
  );

  const uploadFinishedQueue = useSelector(
    (state: store) => state.Sync.uploadFinishedQueue
  );
  return (
    <BaseDrawer
      doingQueue={uploadingQueue}
      finishedQueue={uploadFinishedQueue}
      remainingQueueFunction={getRemainingUploads}
    />
  );
};

const SliderDrawer = () => {
  const isUploadsDrawerVisible = useSelector(
    (state: store) => state.Sync.showUploadsDrawer
  );

  const isDownloadsDrawerVisible = useSelector(
    (state: store) => state.Sync.showDownloadsDrawer
  );

  const dispatch = useDispatch();

  return (
    <div>
      <Drawer
        title="Uploads"
        placement="right"
        closable
        onClose={() => dispatch(closeSyncDrawer())}
        visible={isUploadsDrawerVisible}
        width="300"
        bodyStyle={{ padding: 0 }}
        className="hideScrollbar"
      >
        <UploadsDrawer />
      </Drawer>
      <Drawer
        title="Downloads"
        placement="right"
        closable
        onClose={() => dispatch(closeSyncDrawer())}
        visible={isDownloadsDrawerVisible}
        width="300"
        bodyStyle={{ padding: 0 }}
        className="hideScrollbar"
      >
        <DownloadsDrawer />
      </Drawer>
    </div>
  );
};
// ////////////////////////////////////////////////////////////////////////////////////
export default SliderDrawer;
