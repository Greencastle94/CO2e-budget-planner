import React, { Component } from 'react';
import './App.css';
import NumericInput from 'react-numeric-input';
import { VictoryPie, VictoryLabel } from 'victory';

// 1. INPUT CURRENT CO2e
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
    this.props.confirm(this.state.tempCurrentCO2e);
  }

  render() {
    return (
      <div>
        <div>Fyll i nedan ditt totala växthusgasutsläpp för ett år</div>
        <NumberInputForm value={this.state.tempCurrentCO2e} handleChange={this.handleChange} handleSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

function NumberInputForm (props) {
  return (
    <form onSubmit={props.handleSubmit}>
      <label>
        <NumericInput className="NumberInput" strict={true} min={0} precision={1} value={props.value} onChange={props.handleChange}/>
        ton
      </label>
      <br/>
      <input type="submit" value="Nästa steg" />
    </form>
  );
}


// 2. SETTING CO2e GOAL BUDGET LIMIT
class SetBudgetPage extends Component {
  constructor(props) {
    super(props);
    this.upperLimitRadius = 100;
    this.exampleAverage = this.props.currentCO2e/2; // Temporary
    this.exampleRadius = this.calculateRadius(this.exampleAverage);

    this.state = {
      tempGoalCO2e: this.props.currentCO2e/2,
      goalRadius: this.calculateRadius(this.props.currentCO2e/2)
    };

    // this.calculateRadius = this.calculateRadius.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  calculateRadius(CO2eValue) {
    console.log("I'm working!");
    return CO2eValue/this.props.currentCO2e*this.upperLimitRadius;
  }

  handleChange(event) {
    this.setState({
      tempGoalCO2e: event.target.value,
      goalRadius: this.calculateRadius(event.target.value)
    });
  }

  handleSubmit() {
    this.props.confirm(this.state.tempGoalCO2e);
  }

  render() {
    return (
      <div>
        <div>Sätt taket för din målbudget</div>
        <svg viewBox="0 0 220 220">
          <VictoryPie
            standalone={false}
            width={220} height={220}
            data={[{x: " ", y: 1}]}
            radius={this.state.goalRadius}
            innerRadius={this.state.goalRadius-20}
            colorScale={["green"]}
          />
          <circle cx="110" cy="110" r={this.exampleRadius} fill="none" stroke="black" strokeWidth={3} strokeDasharray="6"/>
          <circle cx="110" cy="110" r={this.upperLimitRadius} fill="none" stroke="red" strokeWidth={3}/>
          <VictoryLabel
            textAnchor="middle" verticalAnchor="middle"
            x={110} y={110}
            style={{fontSize: 20}}
            text="CO2e"
          />
        </svg>
        <div>{this.state.tempGoalCO2e}</div>
        <RangeInputForm
          max={this.props.currentCO2e}
          startValue={this.state.tempGoalCO2e}
          handleChange={this.handleChange}
        />
        <button type="button" onClick={this.handleSubmit}>Nästa steg</button>
      </div>
    );
  }
}

function RangeInputForm(props) {
  return (
    <form>
      <input type="range" min="0" max={props.max} step="0.1" value={props.startValue} onChange={props.handleChange}/>
    </form>
  );
}


// 3. ALLOCATE PORTIONS OF BUDGET TO DIFFERENT CATEGORIES
class SetDetailBudgetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return(
      <div>
        <div>Planera din budget</div>
        <VictoryPie
          data={[
            {x: "Transport", y: 5},
            {x: "Boende", y: 3},
            {x: "Mat & Dryck", y: 2},
            {x: "Övrig konsumption", y: 1}
          ]}
          colorScale={["blue", "yellow", "green", "pink"]}
        />
        <BudgetControlPanel/>
        <button type="button">Tillbaka</button>
      </div>
    );
  }
}

function BudgetControlPanel(props) {
  return (
    <div>
      <RangeInputForm
        max={100}
        startValue={50}
        handleChange={0}
      />
    </div>
  );
}

class BudgetGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      externalMutations: this.props.externalMutations,
    };
  }

  render() {
    return (
      <svg viewBox="0 0 220 220">
        <VictoryPie
          externalEventMutations={this.state.externalMutations}
          standalone={false}
          width={220} height={220}
          data={[{x: " ", y: 1}]}
          radius={this.props.goalRadius}
          innerRadius={this.props.goalRadius-20}
          colorScale={["green"]}
        />
        <circle cx="110" cy="110" r={this.props.exampleRadius} fill="none" stroke="black" strokeWidth={3} strokeDasharray="6"/>
        <circle cx="110" cy="110" r={this.props.upperLimitRadius} fill="none" stroke="red" strokeWidth={3}/>
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


// THE WHOLE WEB APP
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 1,
      currentCO2e: 11,
      budgetLimit: 6,
    };
  }

  confirmCurrentEmissions(value) {
    this.setState({
      currentCO2e: value,
      phase: 2
    });
  }

  confirmBudgetLimit(value) {
    this.setState({
      budgetLimit: value,
      phase: 3
    });
  }

  render() {
    let mainContent;
    switch (this.state.phase) {
      case 1:
        mainContent = <InputPage confirm={(v)=>this.confirmCurrentEmissions(v)}/>
        break;
      case 2:
        mainContent = <SetBudgetPage
                        currentCO2e={this.state.currentCO2e}
                        confirm={(v)=>this.confirmBudgetLimit(v)}
                      />
        break;
      case 3:
        mainContent = <SetDetailBudgetPage
                        budgetLimit={this.state.budgetLimit}
                        confirm={(v)=>this.confirmBudgetLimit(v)}
                      />
        break;
      default:
        break;
    }

    return (
      <div className="App">
        {mainContent}
      </div>
    );
  }
}

export default App;
