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
import { CCODES } from './Pages/modules/get_AppData';

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

render(
  <Provider store={store}>
    <Router>
      <MAIN />
    </Router>
  </Provider>,
  document.getElementById('root')
);
