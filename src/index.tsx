import './App.global.css';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
} from 'react-router-dom';
import { ipcRenderer } from 'electron';
import Store, { store } from './Redux/store';
import App from './App';
import Login from './Pages/Login';
import GlobalScriptHandler from './modules/GlobalHandler';

// Top Routes
const MAIN = () => {
  const history = useHistory();

  useEffect(() => {
    ipcRenderer.on('scheduler-response', (evt, reposnse) =>
      GlobalScriptHandler(reposnse, history)
    );
  }, []);

  const isGoogleLoggedIN = useSelector(
    (state: store) => state.AppSettings.cloudLoginStatus.googleDrive
  );

  return (
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route path="*">
        {isGoogleLoggedIN ? <App /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
};

render(
  <Provider store={Store}>
    <Router>
      <MAIN />
    </Router>
  </Provider>,
  document.getElementById('root')
);
