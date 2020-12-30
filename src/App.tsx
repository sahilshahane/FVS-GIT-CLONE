import React from 'react';
import { Layout, Row } from 'antd';

import NAV_BAR from './Pages/Components/Nav-bar';
// eslint-disable-next-line import/no-cycle
import InnerRoutes from './InnerRoutes';
import SideBar from './Pages/Components/Side-Bar';
import AddFolder from './Pages/Components/Add-Folder';
import log from './Pages/modules/log';

const { Content } = Layout;

const App = () => {
  log('Rendering App_Inner.tsx');
  return (
    <Layout>
      <SideBar />
      <Layout style={{ padding: 5 }} className="app-bg">
        <Content style={{ backgroundColor: 'inherit' }}>
          <NAV_BAR />
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
