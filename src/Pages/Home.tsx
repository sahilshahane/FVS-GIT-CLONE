import React from 'react';
import log from './modules/log';
import RoutingArea from './Components/Routing-area';

const Home = () => {
  log('Rendering Home.tsx');

  return (
    <div style={{ width: '100%' }}>
      <RoutingArea />
    </div>
  );
};

export default Home;
