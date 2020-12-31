import React from 'react';
import log from './modules/log';
import FolderArea from './Components/folder-area';

const Home = () => {
  log('Rendering Home.tsx');

  return (
    <div style={{ width: '100%' }}>
      <FolderArea />
    </div>
  );
};

export default Home;
