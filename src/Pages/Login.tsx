import electron from 'electron';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Modal, Col, Button, Space } from 'antd';
import {
  saveGoogleLogin,
  saveSettings,
} from './modules/Redux/AppSettingsSlicer';
import log from './modules/log';
import {
  CCODES,
  setSchedulerHandler,
  sendSchedulerTask,
} from './modules/get_AppData';

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
  log('Rendering Login.tsx');
  const dispatch = useDispatch();
  const history = useHistory();

  const SaveLoginInfo = (INFO_OBJ: any) => {
    dispatch(saveGoogleLogin(INFO_OBJ));
    dispatch(saveSettings());
    history.push('/');
  };

  const SCRIPT_HANDLER = (data: any) => {
    switch (data.code) {
      case CCODES.GOOGLE_LOGIN_SUCCESS:
        const USER_INFO = data.data;
        SaveLoginInfo(USER_INFO);
        Modal.destroyAll();
        break;
      case CCODES.GOOGLE_LOGIN_FAILED:
        break;
    }
  };

  const startLogin = () => {
    showWarning();
    sendSchedulerTask({ code: CCODES.START_GOOGLE_LOGIN });
  };

  useEffect(() => {
    setSchedulerHandler(SCRIPT_HANDLER);
  }, []);

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
          <Button onClick={startLogin}>Connect : Google Drive</Button>
        </Space>
      </Col>
    </div>
  );
};

export default Login;
