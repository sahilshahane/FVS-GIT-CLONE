/* eslint-disable react/jsx-pascal-case */
import React from 'react';
import { Layout, Row } from 'antd';

import Search_Bar from './Pages/Components/Search_Bar';
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
