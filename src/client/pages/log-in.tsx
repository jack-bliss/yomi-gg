import { FormEvent } from "../../../node_modules/@types/react";
import * as React from 'react';
import { Input } from "../components/input";
import { EmailValidator } from '../../validators/email.validator';
import { PasswordValidator } from '../../validators/password.validator';
import { Profile } from '../../models/profile.model';
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as qs from 'qs';


interface LogInFormState {
  email: string;
  password: string;
  error: string;
}

class LogInForm extends React.Component<{}, LogInFormState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EmailValidator(this.state.email)) {
      this.setState({
        error: 'That email address is invalid.',
      });
    }
    if (!PasswordValidator(this.state.password)) {
      this.setState({
        error: 'Passwords are at least 6 characters long.',
      });
    }
    
    axios
      .post('/auth/log-in', qs.stringify({
        email: this.state.email,
        password: this.state.password,
      }))
      .then((response: AxiosResponse<Profile>) => {
        console.log(response);
      }).catch((e: AxiosError) => {
        console.error(e.response);
      });
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <Input label="Email" onChange={(email) => this.setState({ email })} />
      <Input label="Password" type="password" onChange={(password) => this.setState({ password })} />
      <input type="submit" value="Log In" />
      {this.state.error ? <div className="error">{this.state.error}</div> : null}
    </form>;
  }

}

export const LogIn = () => {

  return <div id="log-in">

    <LogInForm></LogInForm>

  </div>;

}