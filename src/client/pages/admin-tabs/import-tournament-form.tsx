import * as React from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as qs from 'qs';
import { Input } from '../../components/input';

interface ImportTournamentFormState {
  slug: string;
  groups: string;
  state: 'ready' | 'loading' | 'done' | 'error';
}

export class ImportTournamentForm extends React.Component<{}, ImportTournamentFormState> {

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