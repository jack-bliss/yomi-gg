import * as React from 'react';
import { Switch, Route, match, NavLink } from 'react-router-dom';
import { Input } from '../components/input';
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as qs from 'qs';

interface ImportTournamentFormState {
  slug: string;
  groups: string;
  state: 'ready' | 'loading' | 'done' | 'error';
}

class ImportTournamentForm extends React.Component<{}, ImportTournamentFormState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      slug: '',
      groups: '',
      state: 'ready',
    }
    this.doImport = this.doImport.bind(this);
  }

  doImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.setState({
      state: 'loading',
    })
    axios
      .post('/smashgg/import/', qs.stringify({
        tournament: this.state.slug,
        group_id: this.state.groups,
      }))
      .then((response: AxiosResponse<Event>) => {
        this.setState({
          state: 'done',
        })
      }, (err: AxiosError) => {
        console.error(err.response);
        this.setState({
          state: 'error',
        })
      });
  }

  render() {
    return <form onSubmit={this.doImport}>
      <Input label="Tournament Slug" onChange={slug => this.setState({ slug })} />
      <Input label="Group IDs" onChange={groups => this.setState({ groups })} />
      {
        this.state.state === 'ready' ? 
          <input type="submit" value="import" /> : 
          <span>{this.state.state}</span>
      }
    </form>;
  }

}

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

  return <div id="admin">
    <h2>Admin Page</h2>

    <div id="actions-list">
      
      {AdminTabs.map(tab => 
        <NavLink to={'/admin/' + tab.tabSlug} activeClassName="active">{tab.tabName}</NavLink>
      )}

    </div>

    <div id="tab-outlet">
      <Switch>
        
        {AdminTabs.map(tab => 
          <Route path={'/admin/' + tab.tabSlug} component={tab.component} />
        )}

      </Switch>
    </div>

  </div>;

}