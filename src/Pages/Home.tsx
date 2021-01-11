import React from 'react';
import log from './modules/log';
import FS_Navigation_Bar from './Components/FS_Navigation_Bar';

const Home = () => {
  log('Rendering Home.tsx');

  return (
    <div style={{ width: '100%' }}>
      <FS_Navigation_Bar />
    </div>
  );
};

export default Home;
