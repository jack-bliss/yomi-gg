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

interface AdminProps {
  match: match<any>,
}

export const Admin = ({ match }: AdminProps) => {

  return <div id="admin">
    <h2>Admin Page</h2>

    <div id="actions-list">
      
      <NavLink to="/admin/import" activeClassName="selected">Import</NavLink>

    </div>

    <Switch>
      
      <Route path={match.url + '/import'} component={ImportTournamentForm} />

    </Switch>

  </div>;

}