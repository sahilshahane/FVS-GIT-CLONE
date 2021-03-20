/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer, List, Collapse, Spin, Empty } from 'antd';
import { nanoid } from '@reduxjs/toolkit';
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  PauseCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import {
  closeSyncDrawer,
  SYNC_INPUT,
  SYNC_DATA_STRUCTURE,
  DoingQueue,
  WatingQueueInterface,
  FinishedQueueInterface,
} from '../Redux/SynchronizationSlicer';
import { store } from '../Redux/store';

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
  WaitingQueue: WatingQueueInterface,
  FinishedQueue: FinishedQueueInterface,
  RepoID: number | string
) => {
  return true;
  // return (
  //   DoingQueue_.find((val) => val.RepoID == RepoID) == -1 ||
  //   !WaitingQueue[RepoID]?.length ||
  //   !FinishedQueue[RepoID]?.length
  // );
};

const CustomSpin = ({ children, RepoData }: any) => {
  const [spinningProps, setSpinningProps] = useState({
    spinning: false,
    tip: '',
  });

  useEffect(() => {
    const isAllocationRemaing = Object.values(RepoData).find(
      (driveID) => !driveID
    );

    if (isAllocationRemaing > -1)
      setSpinningProps({ spinning: true, tip: 'Allocating Folders...' });
    else setSpinningProps({ spinning: false, tip: '' });
  }, [RepoData]);

  return (
    <div>
      <Spin spinning={spinningProps.spinning} tip={spinningProps.tip}>
        {children}
      </Spin>
    </div>
  );
};

// ////////////////////////////////////////////////////////////////////////////////////

const DownloadsDrawer = () => {
  const downloadWatingQueue = useSelector(
    (state: store) => state.Sync.downloadWatingQueue
  );

  const downloadingQueue = useSelector(
    (state: store) => state.Sync.downloadingQueue
  );

  const downloadFinishedQueue = useSelector(
    (state: store) => state.Sync.downloadFinishedQueue
  );

  const RepoData = useSelector((state: store) => state.Sync.RepoData);

  const UserRepos = useSelector((state: store) => state.UserRepoData.info);

  return (
    <Collapse bordered={false} style={{ margin: 0, padding: 0, width: 300 }}>
      {Object.keys(RepoData).map((RepoID) =>
        shouldShowRepo(
          downloadingQueue,
          downloadWatingQueue,
          downloadFinishedQueue,
          RepoID
        ) ? null : (
          <Collapse.Panel header={UserRepos[RepoID].displayName} key={nanoid()}>
            {downloadingQueue.length ? (
              <List
                dataSource={downloadingQueue}
                renderItem={(data) =>
                  !(data.RepoID === RepoID) ? null : (
                    <List.Item.Meta
                      avatar={getStatusIcon(data.status)}
                      title={data.fileName}
                    />
                  )
                }
              />
            ) : null}

            {/* <Divider /> */}
            {(downloadWatingQueue[RepoID] &&
              downloadWatingQueue[RepoID].length && (
                <List
                  dataSource={downloadWatingQueue[RepoID]}
                  renderItem={(data) => (
                    <List.Item.Meta
                      avatar={getStatusIcon(data.status)}
                      title={data.fileName}
                    />
                  )}
                />
              )) ||
              null}
            {/* <Divider /> */}
            {(downloadFinishedQueue[RepoID] &&
              downloadFinishedQueue[RepoID].length && (
                <List
                  dataSource={downloadFinishedQueue[RepoID]}
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
        )
      )}
    </Collapse>
  );
};

// ////////////////////////////////////////////////////////////////////////////////////

const UploadsDrawer = () => {
  const uploadWatingQueue = useSelector(
    (state: store) => state.Sync.uploadWatingQueue
  );

  const uploadingQueue = useSelector(
    (state: store) => state.Sync.uploadingQueue
  );

  const uploadFinishedQueue = useSelector(
    (state: store) => state.Sync.uploadFinishedQueue
  );

  const RepoData = useSelector((state: store) => state.Sync.RepoData);

  const UserRepos = useSelector((state: store) => state.UserRepoData.info);

  return (
    <Collapse bordered={false} style={{ margin: 0, padding: 0, width: 300 }}>
      {Object.keys(RepoData).map(
        (RepoID) =>
          shouldShowRepo(
            uploadingQueue,
            uploadWatingQueue,
            uploadFinishedQueue,
            RepoID
          ) && (
            <Collapse.Panel
              header={UserRepos[RepoID].displayName}
              key={nanoid()}
            >
              <CustomSpin RepoData={RepoData} key={nanoid()}>
                {uploadingQueue.length ? (
                  <List
                    dataSource={uploadingQueue}
                    renderItem={(data) =>
                      !(data.RepoID === RepoID) ? null : (
                        <List.Item.Meta
                          avatar={getStatusIcon(data.status)}
                          title={data.fileName}
                        />
                      )
                    }
                  />
                ) : null}

                {/* <Divider /> */}
                {(uploadWatingQueue[RepoID] &&
                  uploadWatingQueue[RepoID].length && (
                    <List
                      dataSource={uploadWatingQueue[RepoID]}
                      renderItem={(data) => (
                        <List.Item.Meta
                          avatar={getStatusIcon(data.status)}
                          title={data.fileName}
                        />
                      )}
                    />
                  )) ||
                  null}
                {/* <Divider /> */}
                {(uploadFinishedQueue[RepoID] &&
                  uploadFinishedQueue[RepoID].length && (
                    <List
                      dataSource={uploadFinishedQueue[RepoID]}
                      renderItem={(data) => (
                        <List.Item.Meta
                          avatar={getStatusIcon('FINISHED')}
                          title={data.fileName}
                        />
                      )}
                    />
                  )) ||
                  null}
              </CustomSpin>
            </Collapse.Panel>
          )
      )}
    </Collapse>
  );
};

// ////////////////////////////////////////////////////////////////////////////////////
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
