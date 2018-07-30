import * as React from 'react';
import styled from 'styled-components';

interface InputProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: 'text' | 'password';
}

interface InputState {
  value: string;
  type: 'text' | 'password';
}

const InputLabel = styled.span`
  min-width: 150px;
  display: inline-block;
`;

export class Input extends React.Component<InputProps, InputState> {

  constructor(props: InputProps) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      type: props.type ? props.type : 'text',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: { target: HTMLInputElement }) {
    const value = e.target.value;
    this.setState({ value });
    this.props.onChange(value);
  }

  render() {
    return <div>
      <InputLabel>{this.props.label}</InputLabel>
      <input 
        type={this.state.type} 
        value={this.state.value} 
        onChange={this.handleChange}
      />
    </div>;
  }
}