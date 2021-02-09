/* eslint-disable default-case */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Modal, Col, Button, Space, Divider } from 'antd';
import Particles from 'react-particles-js';
import particlesConfig from './modules/particalConfig';
import {
  saveGoogleLogin,
  saveRepositorySettings,
} from './modules/Redux/AppSettingsSlicer';
import log from './modules/log';
import {
  CCODES,
  setSchedulerHandler,
  sendSchedulerTask,
  Scheduler,
} from './modules/get_AppData';
import GoogleDrivePNG from '../../assets/icons/googledriveicon2.png';

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
    dispatch(saveRepositorySettings());
    history.push('/');
  };

  const SCRIPT_HANDLER = (data: any) => {
    switch (data.code) {
      case CCODES.GOOGLE_LOGIN_SUCCESS:
        // eslint-disable-next-line no-case-declarations
        const USER_INFO = data.data;
        SaveLoginInfo(USER_INFO);
        Modal.destroyAll();
        Scheduler.removeAllListeners('message');
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
      <div style={{ position: 'absolute' }}>
        <Col
          className="component-bg"
          style={{
            width: '300px',
            height: '200px',
            alignItems: 'center',
          }}
        >
          <Divider className="Divider-align" />
          <div className="space-align-block">
            <Space align="center">
              <Button onClick={startLogin}>
                <img
                  src={GoogleDrivePNG}
                  className="Image-Align-google"
                  alt="Google Drive Icon"
                />
                &nbsp; Login with GoogleDrive
              </Button>
            </Space>
          </div>
        </Col>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <Particles height="100vh" width="100vw" params={particlesConfig} />
      </div>
    </div>
  );
};

export default Login;
