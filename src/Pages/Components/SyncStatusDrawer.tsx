/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer, List, Typography, Space } from 'antd';
import { Dispatch } from '@reduxjs/toolkit';
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  PauseCircleTwoTone,
  CloseCircleTwoTone,
} from '@ant-design/icons';
import {
  closeSyncDrawer,
  SYNC_INPUT,
} from '../modules/Redux/SynchronizationSlicer';
import { RepositoryInfo } from '../modules/Redux/UserRepositorySlicer';

const getStatusIcon = (
  status: 'WAITING' | 'RUNNING' | 'PAUSED' | 'FAILED' | 'FINISHED'
) => {
  const iconSize = '1.2rem';
  // eslint-disable-next-line default-case
  switch (status) {
    case 'RUNNING':
      return <LoadingOutlined style={{ fontSize: iconSize }} />;
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
  }
  return null;
};

const TEMPLATE = ({
  REPOSITORY_LIST,
  DATA_LIST,
}: {
  REPOSITORY_LIST: Array<RepositoryInfo>;
  DATA_LIST: Array<SYNC_INPUT>;
}) => {
  return (
    <>
      <List
        itemLayout="vertical"
        dataSource={DATA_LIST}
        renderItem={(file) => (
          <List.Item>
            <Space>
              {getStatusIcon(file.status)}
              <Typography.Text>{file.fileName}</Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </>
  );
};

const DownloadsStatus = ({
  dispatch,
  REPOSITORY_LIST,
}: {
  REPOSITORY_LIST: Array<RepositoryInfo>;
  dispatch: Dispatch<any>;
}) => {
  const isVisible = useSelector((state) => state.Sync.showDownloadsDrawer);
  // DATA_LIST = Downloads_List
  const DATA_LIST = useSelector((state) => state.Sync.downloads);

  return (
    <Drawer
      title="Downloads"
      placement="right"
      closable
      onClose={() => dispatch(closeSyncDrawer())}
      visible={isVisible}
      width="300"
    >
      <TEMPLATE {...{ REPOSITORY_LIST, DATA_LIST }} />
    </Drawer>
  );
};
const UploadsStatus = ({
  dispatch,
  REPOSITORY_LIST,
}: {
  REPOSITORY_LIST: Array<RepositoryInfo>;
  dispatch: Dispatch<any>;
}) => {
  const isVisible = useSelector((state) => state.Sync.showUploadsDrawer);
  // DATA_LIST = Uploads_List
  const DATA_LIST = useSelector((state) => state.Sync.uploads);

  return (
    <Drawer
      title="Uploads"
      placement="right"
      closable
      onClose={() => dispatch(closeSyncDrawer())}
      visible={isVisible}
      width="300"
    >
      <TEMPLATE {...{ REPOSITORY_LIST, DATA_LIST }} />
    </Drawer>
  );
};

const SliderDrawer = () => {
  const dispatch = useDispatch();
  const REPOSITORY_LIST = useSelector((state) => state.UserRepoData.info);

  return (
    <>
      <DownloadsStatus {...{ dispatch, REPOSITORY_LIST }} />
      <UploadsStatus {...{ dispatch, REPOSITORY_LIST }} />
    </>
  );
};

export default SliderDrawer;
