import { Menu } from 'antd';
import React from 'react';
import { IoSyncCircle } from 'react-icons/io5';

const SyncFiles = () => {
  return <Menu.Item icon={<IoSyncCircle />}>Sync Files</Menu.Item>;
};

export default SyncFiles;
