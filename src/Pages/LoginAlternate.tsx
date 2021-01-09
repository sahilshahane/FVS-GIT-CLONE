import React from 'react';
import { useHistory } from 'react-router-dom';
import { Modal, Col, Button, Space } from 'antd';
import { Dispatch } from 'redux';
import { History } from 'history';
import { useDispatch } from 'react-redux';
import {
  saveGoogleLogin,
  saveSettings,
} from './modules/Redux/AppSettingsSlicer';
import GoogleLogin from './modules/GoogleLogin';
import log from './modules/log';

const failedToLogin = () => {
  Modal.destroyAll();
  Modal.error({
    title: 'Failed to Login',
    content: (
      <div>
        <p>Please Try Again, if this continues try contacting developer</p>
        <p>Developer Email - sahilpshahane@gmail.com</p>
      </div>
    ),
    onOk: () => {
      Modal.destroyAll();
    },
  });
};

const startLogin = async (
  dispatch: Dispatch<any>,
  history: string[] | History<any>
) => {
  const SaveLoginInfo = (INFO_OBJ: any) => {
    dispatch(saveGoogleLogin(INFO_OBJ));
    dispatch(saveSettings());
    history.push('/');
  };

  GoogleLogin((err: any, USER_INFO: any) => {
    if (err) failedToLogin();
    SaveLoginInfo(USER_INFO);
  });

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
  const history = useHistory();
  const dispatch = useDispatch();
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
          <Button onClick={() => startLogin(dispatch, history)}>
            Connect : Google Drive
          </Button>
        </Space>
      </Col>
    </div>
  );
};

export default Login;
