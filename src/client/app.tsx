import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { LogIn } from './pages/log-in';
import { Admin } from './pages/admin';
import { Index } from './pages/index';

const outlet = document.getElementById('outlet');

const App = () => {
  return <>
    <Route path="/log-in" component={LogIn} /> 
    <Route path="/admin" component={Admin} />
    <Route path="/" exact={true} component={Index} />
  </>;
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
, outlet);