import React from 'react';
import log from './modules/log';
<<<<<<< HEAD
// import FolderArea from './Components/folder-area';
import RoutingArea from './Components/Routing-area';
=======
import FolderArea from './Components/folder-area';
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6

const Home = () => {
  log('Rendering Home.tsx');

  return (
    <div style={{ width: '100%' }}>
<<<<<<< HEAD
      <RoutingArea />
=======
      <FolderArea />
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
    </div>
  );
};

export default Home;
