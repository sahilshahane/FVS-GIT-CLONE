import React from 'react';
import { Switch, Route } from 'react-router-dom';
import log from './Pages/modules/log';
import SyncStatusDrawer from './Pages/Components/SyncStatusDrawer';

// Pages
import Home from './Pages/Home';
import Settings from './Pages/Settings';
import Page_404 from './Pages/Page_404';

// Inner Routes
const InnerRoutes = () => {
  log('Rendering InnerRoutes.tsx');

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
