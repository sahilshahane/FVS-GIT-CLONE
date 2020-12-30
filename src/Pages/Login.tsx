import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Button, Space } from 'antd';
import {
  saveGoogleLogin,
  saveSettings,
} from './modules/Redux/AppSettingsSlicer';
import log from './modules/log';

const SaveLoginInfo = (userName: string, DriveSpaceLeft: number) => {
  const dispatch = useDispatch();
  const history = useHistory();

  dispatch(saveGoogleLogin({ userName, DriveSpaceLeft }));
  dispatch(saveSettings());
  history.push('/');
};

const Login = () => {
  log('Rendering Login.tsx');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Col
        className="component-bg"
        style={{
          width: '500px',
          height: '500px',
        }}
      >
        <Space align="center" style={{ margin: 'auto' }}>
          <Button>Connect : Google Drive</Button>
        </Space>
      </Col>
    </div>
  );
};

export default Login;
