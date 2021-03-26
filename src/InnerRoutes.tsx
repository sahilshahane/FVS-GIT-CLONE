import React from 'react';
import { Switch, Route } from 'react-router-dom';
import log from 'electron-log';
import SyncStatusDrawer from './Components/SyncStatusDrawer';

// Pages
import Home from './Pages/Home';
import Settings from './Pages/Settings';
import Page_404 from './Pages/Page_404';

// Inner Routes
const InnerRoutes = () => {
  log.info('Rendering InnerRoutes.tsx');

  return (
    <div style={{ width: '100%' }}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/settings" component={Settings} />
        <Route path="*" component={Page_404} />
      </Switch>
      <SyncStatusDrawer />
    </div>
  );
};

export default InnerRoutes;
