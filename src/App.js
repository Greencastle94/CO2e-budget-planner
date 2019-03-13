import React, { Component } from 'react';
import './App.css';
import NumericInput from 'react-numeric-input';
import { VictoryPie, VictoryLabel } from 'victory';

// 1. INPUT CURRENT CO2e
function NumberInputForm (props) {
  return (
    <form onSubmit={props.handleSubmit}>
      <label>
        <NumericInput className="NumberInput" strict={true} min={0} precision={1} value={props.value} onChange={props.handleChange}/>
        ton
      </label>
      <input type="submit" value="Nästa steg" />
    </form>
  );
}

class InputPage extends Component {
  constructor(props) {
    super(props);
    this.state = {tempCurrentCO2e: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(value) {
    this.setState({tempCurrentCO2e: value});
  }

  handleSubmit(event) {
    alert('Dina växthusgasutsläpp på ett år är ' + this.state.tempCurrentCO2e + ' ton COe');
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>Fyll i ditt totala växthusgasutsläpp för ett år nedan</div>
        <NumberInputForm value={this.state.tempCurrentCO2e} handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
      </div>
    );
  }
}


// 2. SETTING CO2e GOAL BUDGET LIMIT
function RangeInputForm(props) {
  return (
    <form onSubmit={props.handleSubmit}>
      <input type="range" min="0" max={props.max} step="0.1" value={props.startValue} onChange={props.handleChange}/>
      <br/>
      <input type="submit" value="Nästa steg"/>
    </form>
  );
}

class BudgetGraph extends Component {
  constructor(props) {
    super(props);
    this.upperLimitRadius = 100;
    this.state = {
      goalRadius: this.props.goalBudget/this.props.upperLimit*this.upperLimitRadius,
      exampleRadius: this.props.exampleAverage/this.props.upperLimit*this.upperLimitRadius
    };
    console.log("Start goal value: " + this.state.goalRadius);
  }

  render() {
    return (
      <svg viewBox="0 0 220 220">
        <VictoryPie
          standalone={false}
          width={220} height={220}
          data={[{x: " ", y: 1}]}
          radius={this.state.goalRadius}
          innerRadius={this.state.goalRadius-20}
          colorScale={["green"]}
        />
        <circle cx="110" cy="110" r={this.state.exampleRadius} fill="none" stroke="black" strokeWidth={3} strokeDasharray="6"/>
        <circle cx="110" cy="110" r={this.upperLimitRadius} fill="none" stroke="red" strokeWidth={3}/>
        <VictoryLabel
          textAnchor="middle" verticalAnchor="middle"
          x={110} y={110}
          style={{fontSize: 20}}
          text="CO2e"
        />
      </svg>
    );
  }
}

class SetBudgetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {tempGoalCO2e: this.props.currentCO2e/2};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({tempGoalCO2e: event.target.value});
  }

  handleSubmit(event) {
    alert('Du har satt din målbudget på ' + this.state.tempGoalCO2e + ' ton COe');
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>Sätt taket för din målbudget</div>
        <BudgetGraph
          goalBudget={this.state.tempGoalCO2e}
          upperLimit={this.props.currentCO2e}
          exampleAverage={this.props.currentCO2e/2}
        />
        <div>{this.state.tempGoalCO2e}</div>
        <RangeInputForm
          max={this.props.currentCO2e}
          startValue={this.state.tempGoalCO2e}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}


// THE WHOLE WEB APP
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 1,
      currentCO2e: 11,
      targetCO2e: null,
    };
  }

  render() {
    return (
      <div className="App">
        <SetBudgetPage currentCO2e={this.state.currentCO2e}/>
      </div>
    );
  }
}

export default App;
