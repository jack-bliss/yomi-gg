import * as React from 'react';
import { Switch, Route, match, NavLink } from 'react-router-dom';
import { Input } from '../components/input';
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as qs from 'qs';
import styled from 'styled-components';
import { SubTitle } from '../components/sub-title';
import { LinkStyling } from '../components/a';
import { ImportTournamentForm } from './admin-tabs/import-tournament-form';

const AdminRoot = styled.div`
  display: grid;
  grid-template-columns: 20px auto 20px 1fr;
  grid-template-rows: 50px auto 20px 1fr;
  grid-template-areas:
    ". .       . ."
    ". title   . ."
    ". .       . ."
    ". actions . outlet";
`;

const AdminTitle = SubTitle.extend`
  grid-area: title;
`;

const StyledNavLink = styled(NavLink)`
  display: block;
  margin-bottom: 20px;
  ${LinkStyling}
`;

const ActionsList = styled.div`
  grid-area: actions;
`;

const TabOutLet = styled.div`
  grid-area: outlet;
`;

class ManageTournamentForm extends React.Component<{}, {}> {

  render() {
    return <div>Manage Goes Here</div>
  }

}

interface AdminProps {
  match: match<any>,
}

const AdminTabs = [
  {
    tabSlug: 'import',
    component: ImportTournamentForm,
    tabName: 'Import'
  },
  {
    tabSlug: 'manage',
    component: ManageTournamentForm,
    tabName: 'Manage',
  }
]

export const Admin = ({ match }: AdminProps) => {

  return <AdminRoot id="admin">
    <AdminTitle>Admin</AdminTitle>

    <ActionsList>
      
      {AdminTabs.map(tab => 
        <StyledNavLink to={'/admin/' + tab.tabSlug} activeClassName="active">{tab.tabName}</StyledNavLink>
      )}

    </ActionsList>

    <TabOutLet>
      <Switch>
        {AdminTabs.map(tab => 
          <Route path={'/admin/' + tab.tabSlug} component={tab.component} />
        )}
      </Switch>
    </TabOutLet>

  </AdminRoot>;

}