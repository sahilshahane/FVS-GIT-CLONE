/* eslint-disable react/jsx-pascal-case */
import React, { useEffect } from 'react';
import { Layout, Row } from 'antd';

import Search_Bar from './Pages/Components/Search_Bar';
// eslint-disable-next-line import/no-cycle
import InnerRoutes from './InnerRoutes';
import SideBar from './Pages/Components/Side-Bar';
import AddFolder from './Pages/Components/Add-Folder';
import log from './Pages/modules/log';
import GlobalScriptHandler from './Pages/modules/GlobalHandler';
import { setSchedulerHandler } from './Pages/modules/get_AppData';
import { LOAD_ONCE_AFTER_APP_READY } from './Pages/modules/backgroundTasks';

const { Content } = Layout;

const App = () => {
  log('Rendering App_Inner.tsx');

  useEffect(() => {
    setSchedulerHandler(GlobalScriptHandler);
    LOAD_ONCE_AFTER_APP_READY();
  }, []);

  return (
    <Layout>
      <SideBar />
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
