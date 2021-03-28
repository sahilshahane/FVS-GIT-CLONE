import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Layout, Menu, Divider } from 'antd';
import {
  PieChartOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  RadiusBottomrightOutlined,
} from '@ant-design/icons';
import log from 'electron-log';
import Profile from './Side-Bar_Profile';
import IgnoreDataSelector from './IgnoreDataSelector';
import {
  showDownloadsDrawer,
  showUploadsDrawer,
} from '../Redux/SynchronizationSlicer';

const { Sider } = Layout;

const SiderBar = () => {
  const IgnoreRef = useRef(null);
  const [collapsed, setCollapsed] = useState(true);
  const dispatch = useDispatch();

  return (
    <div style={{ background: 'rgb(27, 27, 27)' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          // overflow: 'auto',
          height: '100vh',
          position: 'sticky',
        }}
        className="component-bg"
      >
        <Divider style={{ backgroundColor: 'inherit' }}>
          <Profile showName={collapsed} />
        </Divider>
        <Menu theme="dark" mode="inline" style={{ backgroundColor: 'inherit' }}>
          <Menu.Item
            key="StateIgnore"
            icon={<PieChartOutlined />}
            onClick={() => IgnoreRef.current.show()}
          >
            Ignore Files
            <IgnoreDataSelector ref={IgnoreRef} />
          </Menu.Item>

          <Menu.Item
            icon={<CloudUploadOutlined />}
            onClick={() => dispatch(showUploadsDrawer())}
          >
            Uploads
          </Menu.Item>

          <Menu.Item
            icon={<CloudDownloadOutlined />}
            onClick={() => dispatch(showDownloadsDrawer())}
          >
            Downloads
          </Menu.Item>
        </Menu>
      </Sider>
    </div>
  );
};
export default SiderBar;
