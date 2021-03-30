/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import log from 'electron-log';
import Navigation_Bar from '../Components/Navigation_Bar';
import RepositoryArea from '../Components/folder-area';
import SyncStatus from '../Components/SyncStatus';

const Home = () => {
  return (
    <>
      <Navigation_Bar />
      <RepositoryArea />
      <SyncStatus />
    </>
  );
};

export default Home;
