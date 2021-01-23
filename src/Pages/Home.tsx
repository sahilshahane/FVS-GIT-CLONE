/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import log from './modules/log';
import FS_Navigation_Bar from './Components/FS_Navigation_Bar';
import FolderArea from './Components/folder-area';
import SyncStatus from './Components/SyncStatus';

const Home = () => {
  log('Rendering Home.tsx');

  return (
    <>
      <FS_Navigation_Bar />
      <FolderArea />
      <SyncStatus />
    </>
  );
};

export default Home;
