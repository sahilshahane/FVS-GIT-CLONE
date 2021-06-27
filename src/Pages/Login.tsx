/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable default-case */
import React, { useEffect } from 'react';
import { Modal, Divider, Typography } from 'antd';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Particles from 'react-particles-js';
import { FaGoogleDrive } from 'react-icons/fa';
import { CCODES, sendSchedulerTask } from '../modules/get_AppData';
import { store } from '../Redux/store';
import particlesConfig from '../../assets/configParticles';
import useWindowDimensions from '../hooks/useWindowDimention';

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

  const { width, height } = useWindowDimensions('100vw', '100vh');

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {isGoogleLoggedIN && <Redirect to="/" />}

      <div className="component-bg radius-7 login-area">
        <Typography.Title className="text-center">FHS</Typography.Title>

        <Divider />
        <Typography.Title type="secondary" className="text-center" level={4}>
          Login with
        </Typography.Title>
        <div className="sign-in">
          <button
            type="button"
            onClick={startLogin}
            title="Google Account Required"
          >
            <div className="inner">
              <FaGoogleDrive />
              <span className="label">Google Drive</span>
            </div>
          </button>
        </div>
      </div>
      <div style={{ overflow: 'hidden', width, height }}>
        <Particles height="100vh" width="100vw" params={particlesConfig} />
      </div>
    </div>
  );
};

export default Login;
