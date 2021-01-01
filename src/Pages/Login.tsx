import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Modal, Col, Button, Space } from 'antd';
import { Dispatch } from 'redux';
import { History } from 'history';
import {
  saveGoogleLogin,
  saveSettings,
} from './modules/Redux/AppSettingsSlicer';
import runScript from './modules/Run-Script';
import log from './modules/log';
import { CCODES } from './modules/get_App_Data';

const RunLoginScript = async (
  dispatch: Dispatch<any>,
  history: string[] | History<any>
) => {
  const SaveLoginInfo = (INFO_OBJ: any) => {
    dispatch(saveGoogleLogin(INFO_OBJ));
    dispatch(saveSettings());
    history.push('/');
  };

  const handler = (data: any) => {
    switch (data.code) {
      case CCODES.GOOGLE_LOGIN_STARTED:
        break;
      case CCODES.GOOGLE_LOGIN_FAILED:
        break;
      case CCODES.GOOGLE_LOGIN_SUCCESS:
        Modal.destroyAll();
        break;
      case CCODES.GOOGLE_LOGIN_URL:
        break;
      case CCODES.GOOGLE_ID_FOUND:
        break;
      case CCODES.GOOGLE_USER_INFO:
        // eslint-disable-next-line no-case-declarations
        const USER_INFO = data.data;
        SaveLoginInfo(USER_INFO);
        break;

      default:
        break;
    }
  };

  const forceKill = runScript(handler, {
    args: ['-glogin', '-guserinfo'],
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
      forceKill();
      Modal.destroyAll();
    },
  });
};

const Login = () => {
  log('Rendering Login.tsx');
  const dispatch = useDispatch();
  const history = useHistory();

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
          <Button onClick={() => RunLoginScript(dispatch, history)}>
            Connect : Google Drive
          </Button>
        </Space>
      </Col>
    </div>
  );
};

export default Login;
