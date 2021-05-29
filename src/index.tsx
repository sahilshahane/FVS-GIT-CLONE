import './App.global.css';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
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
import {
  clearUserRepositories,
  removeRepository,
  saveUserRepositoryData,
} from './Redux/UserRepositorySlicer';
import ReduxStore from './Redux/store';
import { disconnectDB_all } from './modules/Database';
// Top Routes
const MAIN = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  useEffect(() => {
    ipcRenderer.on('scheduler-response', (_, reposnse) =>
      GlobalScriptHandler(reposnse, history)
    );

    ipcRenderer.on('save-user-repositories', () =>
      dispatch(saveUserRepositoryData())
    );

    ipcRenderer.on('clear-user-repositories', () => {
      const {
        UserRepoData: { info },
      } = ReduxStore.getState();

      Object.keys(info).forEach((RepoID) =>
        ReduxStore.dispatch(removeRepository(RepoID))
      );
    });
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
