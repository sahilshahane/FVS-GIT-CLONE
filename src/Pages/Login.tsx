/* eslint-disable default-case */
import React, { useEffect } from 'react';
import { Modal, Col, Button, Space, Divider } from 'antd';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CCODES, sendSchedulerTask } from '../modules/get_AppData';
import { store } from '../Redux/store';
import GoogleDrivePNG from '../../assets/icons/googledriveicon.png';
import Particles from 'react-particles-js';
import particlesConfig from 'C:/FVS-GIT-CLONE/src/configParticles.js'

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
 <div style={{position: 'absolute'}}>

      <Col
        className="component-bg"


        style={{
          width: '300px',
          height: '200px',
        alignItems: 'center'
        }}
      >
        <Divider className="Divider-align"/>
         <div className="space-align-block">
        <Space align="center">

            <Button onClick={startLogin} >
              <img src={GoogleDrivePNG} className="Image-Align-google"/>&nbsp;
            Login with GoogleDrive
          </Button>
         </Space>
         </div>
      </Col>
    </div>
        <div>
    <Particles height="100vh" width="100vw" params={particlesConfig}></Particles>
    </div>
    </div>
  );
};

export default Login;
