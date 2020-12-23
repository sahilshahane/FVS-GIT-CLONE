import React from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import {
  saveGoogleLogin,
  saveSettings,
} from '../modules/Redux/AppSettingsSlicer';
import log from '../modules/log';

const Login = () => {
  log('Rendering Login.tsx');
  const dispatch = useDispatch();
  const history = useHistory();

  setTimeout(() => {
    const dataToSave = {
      userName: 'Sahil Shahane',
      DriveSpaceLeft: 12,
    };
    dispatch(saveGoogleLogin(dataToSave));
    dispatch(saveSettings());
    history.push('/');
  }, 5000);
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 3,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        margin: 'auto',
        width: '50%',
        height: '50%',
      }}
      className="component-bg"
    >
      <motion.div>as</motion.div>
    </div>
  );
};

export default Login;
