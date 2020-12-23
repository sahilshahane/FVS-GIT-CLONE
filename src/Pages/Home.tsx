import React from 'react';
import { useSelector } from 'react-redux';
import { CurrentSettings } from './modules/Redux/AppSettingsSlicer';
import log from './modules/log';

const Home = () => {
  log('Rendering Home.tsx');
  const Appsettings = useSelector(CurrentSettings);
  return <h1>{`Current Theme : ${Appsettings.theme}`}</h1>;
};

export default Home;
