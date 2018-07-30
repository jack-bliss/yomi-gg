import * as React from 'react';
import { Input } from "../components/input";
import { EmailValidator } from '../../validators/email.validator';
import { PasswordValidator } from '../../validators/password.validator';
import { Profile } from '../../models/profile.model';
import axios, { AxiosResponse, AxiosError } from 'axios';
import * as qs from 'qs';
import styled from 'styled-components';

const StyledInput = styled(Input)`
  label {
    min-width: 100px;
  }
`;

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

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        if (response.data.type === 'admin') {
          window.location.href = '/admin';
        } else {
          this.setState({
            error: 'Currently, logging in on the website is only for admins. Please use the app if you\'d like to place a bet or manage your settings.',
          });
        }
      }).catch((e: AxiosError) => {
        const YomiError = parseInt(e.response.headers.error_code);
        this.setState({
          error: 'Error: ' + YomiError,
        })
        console.error(YomiError);
      });
  }

  render() {
    return <form onSubmit={this.handleSubmit}>
      <StyledInput label="Email" onChange={(email) => this.setState({ email })} />
      <StyledInput label="Password" type="password" onChange={(password) => this.setState({ password })} />
      <input type="submit" value="Log In" />
      {this.state.error ? <div className="error">{this.state.error}</div> : null}
    </form>;
  }

}

const LogInRoot = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 100px auto;
`;

export const LogIn = () => {

  return <LogInRoot>

    <LogInForm></LogInForm>

  </LogInRoot>;

}