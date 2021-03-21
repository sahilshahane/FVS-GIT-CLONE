/* eslint-disable default-case */
import React, { useEffect } from 'react';
import { Modal, Col, Button, Space } from 'antd';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CCODES, sendSchedulerTask } from '../modules/get_AppData';
import { store } from '../Redux/store';

const showWarning = async () => {
  Modal.info({
    title: 'App will now Open your Browser for Google login',
    content: (
      <div>
        <p>
          Do not worry We cannot control your browser so no sensitive
          information is recorded
        </p>
        <p>Please Wait, This may take some time</p>
      </div>
    ),
    okText: 'Abort Login',
    onOk: () => {
      Modal.destroyAll();
    },
  });
};

const Login = () => {
  const startLogin = () => {
    showWarning();
    sendSchedulerTask({ code: CCODES.START_GOOGLE_LOGIN });
  };
  const isGoogleLoggedIN = useSelector(
    (state: store) => state.AppSettings.cloudLoginStatus.googleDrive
  );
  useEffect(() => {
    if (isGoogleLoggedIN) {
      Modal.destroyAll();
    }
  }, [isGoogleLoggedIN]);
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
      {isGoogleLoggedIN && <Redirect to="/" />}
      <Col
        className="component-bg"
        style={{
          width: '500px',
          height: '500px',
        }}
      >
        <Space align="center" style={{ margin: 'auto' }}>
          <Button onClick={startLogin}>Connect : Google Drive</Button>
        </Space>
      </Col>
    </div>
  );
};

export default Login;
