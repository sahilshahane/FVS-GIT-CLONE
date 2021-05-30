/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useState } from 'react';
import { Layout, Row } from 'antd';
import log from 'electron-log';
import Search_Bar from './Components/Search_Bar';
import InnerRoutes from './InnerRoutes';
import SideBar from './Components/Side-Bar';
import AddFolder from './Components/Add-Folder';
import MediaPlayer from './Components/MediaPlayer';
import { LOAD_ONCE_AFTER_APP_READY } from './modules/backgroundTasks';
import ConnectionError from './Components/ConnectionError';

const { Content } = Layout;

const App = () => {
  useEffect(() => {
    LOAD_ONCE_AFTER_APP_READY();
  }, []);

  return (
    <Layout>
      <SideBar />
      <ConnectionError />
      <MediaPlayer />
      <Layout style={{ padding: 5 }} className="app-bg">
        <Content style={{ backgroundColor: 'inherit' }}>
          <Search_Bar />
          <Row
            style={{
              margin: '5px 0 0 0',
            }}
          >
            <InnerRoutes />
            <AddFolder />
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;
