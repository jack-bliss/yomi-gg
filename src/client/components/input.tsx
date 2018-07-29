import * as React from 'react';

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
    this.setState({ value: e.target.value });
    this.props.onChange(this.state.value);
  }

  render() {
    return <div className="input-group">
      <span>{this.props.label}</span>
      <input 
        type={this.state.type} 
        value={this.state.value} 
        onChange={this.handleChange}
      />
    </div>;
  }

}