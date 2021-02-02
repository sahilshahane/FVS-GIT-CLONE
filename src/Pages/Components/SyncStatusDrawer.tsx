/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
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
} from '../modules/Redux/SynchronizationSlicer';
import { store } from '../modules/Redux/store';

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

// ////////////////////////////////////////////////////////////////////////////////////

const DownloadsDrawer = () => {
  const downloadWatingQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  } = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.downloadWatingQueue
  );

  const downloadingQueue = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.downloadingQueue
  );

  const downloadFinishedQueue: {
    [RepoID: string]: Array<SYNC_INPUT>;
  } = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.downloadFinishedQueue
  );

  const RepoData = useSelector(
    (state: { Sync: SYNC_DATA_STRUCTURE }) => state.Sync.RepoData
  );

  return (
    <Collapse bordered={false}>
      {Object.keys(RepoData).map((RepoID: any) => (
        <Collapse.Panel header={RepoData[RepoID].RepoName} key={nanoid()}>
          <List
            dataSource={downloadingQueue}
            renderItem={(data: any) => (
              <List.Item.Meta
                avatar={getStatusIcon(data.status)}
                title={data.fileName}
              />
            )}
          />
          {/* <Divider /> */}
          <List
            dataSource={downloadWatingQueue[RepoID]}
            renderItem={(data) => (
              <List.Item.Meta
                avatar={getStatusIcon(data.status)}
                title={data.fileName}
              />
            )}
          />
          {/* <Divider /> */}
          <List
            dataSource={downloadFinishedQueue[RepoID]}
            renderItem={(data) => (
              <List.Item.Meta
                avatar={getStatusIcon(data.status)}
                title={data.fileName}
              />
            )}
          />
        </Collapse.Panel>
      ))}
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

  return (
    <Collapse bordered={false}>
      {Object.keys(RepoData).map((RepoID: any) => (
        <Collapse.Panel header={RepoData[RepoID].RepoName} key={nanoid()}>
          <Spin
            spinning={
              !(
                !uploadingQueue.length &&
                !(
                  uploadWatingQueue[RepoID] && uploadWatingQueue[RepoID].length
                ) &&
                !(
                  uploadFinishedQueue[RepoID] &&
                  uploadFinishedQueue[RepoID].length
                )
              ) && !RepoData[RepoID].areFoldersAllocated
            }
            tip="Allocating Folders..."
          >
            {uploadingQueue.length ? (
              <List
                dataSource={uploadingQueue}
                renderItem={(data: any) => (
                  <List.Item.Meta
                    avatar={getStatusIcon(data.status)}
                    title={data.fileName}
                  />
                )}
              />
            ) : null}

            {/* <Divider /> */}
            {uploadWatingQueue[RepoID] && uploadWatingQueue[RepoID].length && (
              <List
                dataSource={uploadWatingQueue[RepoID]}
                renderItem={(data) => (
                  <List.Item.Meta
                    avatar={getStatusIcon(data.status)}
                    title={data.fileName}
                  />
                )}
              />
            )}
            {/* <Divider /> */}
            {uploadFinishedQueue[RepoID] &&
              uploadFinishedQueue[RepoID].length && (
                <List
                  dataSource={uploadFinishedQueue[RepoID]}
                  renderItem={(data) => (
                    <List.Item.Meta
                      avatar={getStatusIcon(data.status)}
                      title={data.fileName}
                    />
                  )}
                />
              )}

            {!uploadingQueue.length &&
              !(
                uploadWatingQueue[RepoID] && uploadWatingQueue[RepoID].length
              ) &&
              !(
                uploadFinishedQueue[RepoID] &&
                uploadFinishedQueue[RepoID].length
              ) && <Empty description="Uploads are completed..." />}
          </Spin>
        </Collapse.Panel>
      ))}
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
    <>
      <Drawer
        title="Uploads"
        placement="right"
        closable
        onClose={() => dispatch(closeSyncDrawer())}
        visible={isUploadsDrawerVisible}
        width="300"
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
      >
        <DownloadsDrawer />
      </Drawer>
    </>
  );
};
// ////////////////////////////////////////////////////////////////////////////////////
export default SliderDrawer;
