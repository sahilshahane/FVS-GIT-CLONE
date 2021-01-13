import React, { useState, useRef } from 'react';
import { Layout, Menu, Divider } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import log from '../modules/log';
import Profile from './Side-Bar_Profile';
import IgnoreDataSelector from './IgnoreDataSelector';

const { Sider } = Layout;

const SiderBar = () => {
  log('Rendering Side-Bar.tsx');

  const IgnoreRef = useRef();
  const [collapsed, setCollapsed] = useState(true);

  const onCollapse = (collapsed_: boolean) => {
    setCollapsed(collapsed_);
  };
  
  return (
    <>
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
        <Menu 
          theme="dark" 
          mode="inline" 
          style={{ backgroundColor: 'inherit' }} 
          onClick={(obj) => {
            switch (obj.key) {
              case 'StateIgnore':
                IgnoreRef.current.showStateChooser();
                break;
            }
          }}>
          <Menu.Item key="StateIgnore" icon={<PieChartOutlined />}>
            Ignore Files
            <IgnoreDataSelector ref={IgnoreRef} />
          </Menu.Item>
        </Menu>
      </Sider>
    </>
  );
};
export default SiderBar;
