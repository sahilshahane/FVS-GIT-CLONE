import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import ParentRoutes from './Routes';
import './App.global.css';
import store from './Pages/modules/Redux/store';

render(
  <Provider store={store}>
    <Router>
      <ParentRoutes />
    </Router>
  </Provider>,
  document.getElementById('root')
);
