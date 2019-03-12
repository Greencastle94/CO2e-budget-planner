import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class CO2eForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('Dina växthusgasutsläpp på ett år är ' + this.state.value + ' ton COe');
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input type="text" value={this.state.value} onChange={this.handleChange} />
          ton
        </label>
        <input type="submit" value="Nästa steg" />
      </form>
    );
  }
}

class InputPhase extends Component {
  handleSubmit() {

  }

  render() {
    return (
      <div>
        <div className="">Fyll i ditt totala växthusgasutsläpp för ett år nedan</div>
        <CO2eForm/>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 1,
      currentCO2e: null,
      targetCO2e: null,
    };
  }

  render() {
    return (
      <div className="App">
        <InputPhase/>
      </div>
    );
  }
}

export default App;
