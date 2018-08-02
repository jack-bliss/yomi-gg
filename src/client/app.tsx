import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { LogIn } from './pages/log-in';
import { Admin } from './pages/admin/admin';
import { Index } from './pages';
import { PrimaryColor, LightColor, SecondaryColor } from './theme';
import { NotFound } from './pages/not-found';
import { Provider } from 'react-redux';
import { store } from './redux/root';

const outlet = document.getElementById('outlet');

const AppRoot = styled.div`
  color: ${LightColor};
  min-height: 100vh;
  font-family: Helvetica, Arial, sans-serif;
    /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#4ca0f4+0,4cffc9+100 */
  background: ${PrimaryColor}; /* Old browsers */
  background: -moz-linear-gradient(45deg, ${PrimaryColor} 0%, ${SecondaryColor} 100%); /* FF3.6-15 */
  background: -webkit-linear-gradient(45deg, ${PrimaryColor} 0%, ${SecondaryColor} 100%); /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(45deg, ${PrimaryColor} 0%, ${SecondaryColor} 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
`;

const App = () => {
  return  <Provider store={store}>
    <AppRoot>
      <Switch>
        <Route path="/log-in" component={LogIn} /> 
        <Route path="/admin" component={Admin} />
        <Route path="/" exact={true} component={Index} />
        <Route component={NotFound} />
      </Switch>
    </AppRoot>
  </Provider>;
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
, outlet);