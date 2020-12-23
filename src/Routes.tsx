import React, { useEffect } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CurrentSettings } from './Pages/modules/Redux/AppSettingsSlicer';
import log from './Pages/modules/log';

// Works as a Static Component
import App from './App';

import Login from './Pages/Components/Login';

// Top Routes
const ParentRoutes = () => {
  log('Rendering Routes.tsx');
  const history = useHistory();
  const Appsettings = useSelector(CurrentSettings);

  useEffect(() => {
    if (!Appsettings.cloudLoginStatus.googleDrive) {
      // eslint-disable-next-line react/prop-types
      history.push('/login');
    } else {
      history.push('/');
    }
  }, [Appsettings.cloudLoginStatus.googleDrive]);

  return (
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route path="*" component={App} />
    </Switch>
  );
};

export default ParentRoutes;
