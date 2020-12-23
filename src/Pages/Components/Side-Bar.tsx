import React, { useState } from 'react';
import { Layout, Menu, Divider } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import log from '../modules/log';
import Profile from './Profile';

const { Sider } = Layout;
const { SubMenu } = Menu;

const SiderBar = () => {
  log('Rendering Side-Bar.tsx');

  const [collapsed, setCollapsed] = useState(true);

  const onCollapse = (collapsed_: boolean) => {
    setCollapsed(collapsed_);
  };
  // console.log('Rendering Side-Bar.tsx');

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
      }}
      className="component-bg"
    >
      <Divider style={{ backgroundColor: 'inherit' }}>
        <Profile showName={collapsed} />
      </Divider>
      <Menu theme="dark" mode="inline" style={{ backgroundColor: 'inherit' }}>
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
        <Menu.Item key="2" icon={<DesktopOutlined />}>
          Option 2
        </Menu.Item>
        <SubMenu key="sub1" icon={<UserOutlined />} title="User">
          <Menu.Item key="3">Tom</Menu.Item>
          <Menu.Item key="4">Bill</Menu.Item>
          <Menu.Item key="5">Alex</Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
          <Menu.Item key="6">Team 1</Menu.Item>
          <Menu.Item key="8">Team 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="9" icon={<FileOutlined />}>
          Files
        </Menu.Item>
      </Menu>
    </Sider>
  );
};
export default SiderBar;
