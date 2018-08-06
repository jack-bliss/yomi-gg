import * as React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { SubTitle } from '../../components/sub-title';
import { LinkStyling } from '../../components/a';
import { ImportTournamentForm } from './tabs/import-tournament-form';
import { ManageTournaments } from './tabs/manage-tournaments/manage-tournaments';

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

const AdminTabLink = styled(NavLink)`
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

const AdminTabs = [
  {
    tabSlug: 'import',
    component: ImportTournamentForm,
    tabName: 'Import'
  },
  {
    tabSlug: 'manage',
    component: ManageTournaments,
    tabName: 'Manage',
  },
  {
    tabSlug: 'scores',
    component: () => <div></div>,
    tabName: 'Scores',
  }
]

export const Admin = () => {

  

  return <AdminRoot id="admin">
    <AdminTitle>Admin</AdminTitle>

    <ActionsList>
      {AdminTabs.map(tab => 
        <AdminTabLink to={'/admin/' + tab.tabSlug} activeClassName="active">{tab.tabName}</AdminTabLink>
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