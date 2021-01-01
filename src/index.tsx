<<<<<<< HEAD
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import ParentRoutes from './Routes';
import './App.global.css';
import store from './Pages/modules/Redux/store';
=======
import './App.global.css';
import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import store from './Pages/modules/Redux/store';
import log from './Pages/modules/log';
import { CurrentSettings } from './Pages/modules/Redux/AppSettingsSlicer';
import App from './App';
import Login from './Pages/Login';
import { CCODES } from './Pages/modules/get_App_Data';

// Top Routes
const MAIN = () => {
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
  }, []);

  return (
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route path="*" component={App} />
    </Switch>
  );
};
console.log(CCODES);
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6

render(
  <Provider store={store}>
    <Router>
<<<<<<< HEAD
      <ParentRoutes />
=======
      <MAIN />
>>>>>>> 2c71fdead2a32e164037931496f7724625683ff6
    </Router>
  </Provider>,
  document.getElementById('root')
);
