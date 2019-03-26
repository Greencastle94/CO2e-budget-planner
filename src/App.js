import React, { Component } from 'react';
import './App.css';
import file from './cats.json';
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

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  calculateRadius(CO2eValue) {
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
        <div>Sätt din årsbudget</div>
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
        <RangeInput
          stepSize="0,1"
          max={this.props.currentCO2e}
          startValue={this.state.tempGoalCO2e}
          handleChange={this.handleChange}
        />
        <button type="button" onClick={this.handleSubmit}>Nästa steg</button>
      </div>
    );
  }
}

function RangeInput(props) {
  return (
    <form>
      <input type="range" min="0" max={props.max} step={props.stepSize} value={props.startValue} onChange={props.handleChange}/>
    </form>
  );
}


// 3. ALLOCATE PORTIONS OF BUDGET TO DIFFERENT CATEGORIES
class SetDetailBudgetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transport: 0,
      housing: 0,
      food: 0,
      other: 0,
      pieAngle: 0
    };
    this.monthlyBudget = this.props.budgetLimit/12*1000;
    this.titles = [
      "Transport",
      "Boende",
      "Mat & Dryck",
      "Övrig konsumtion"
    ];
  }

  calculateAngle() {
    var state = this.state;
    var total = state.transport + state.housing + state.food + state.other;
    return total/this.monthlyBudget*360;
  }

  handleChange(emissionsForCategory) {
    switch (emissionsForCategory.category) {
      case "transport":
        this.setState({
          transport: emissionsForCategory.emissions,
          pieAngle: this.calculateAngle()
        });
        break;
      case "housing":
        this.setState({
          housing: emissionsForCategory.emissions,
          pieAngle: this.calculateAngle()
        });
        break;
      case "food":
        this.setState({
          food: emissionsForCategory.emissions,
          pieAngle: this.calculateAngle()
        });
        break;
      case "other":
        this.setState({
          other: emissionsForCategory.emissions,
          pieAngle: this.calculateAngle()
        });
        break;
      default:
        break;
    }
  }

  render() {
    return(
      <div>
        <div>Planera din månadsbudget</div>
        <svg viewBox="0 0 220 220">
          <VictoryPie
            standalone={false}
            data={[
              {x: this.titles[0], y: this.state.transport},
              {x: this.titles[1], y: this.state.housing},
              {x: this.titles[2], y: this.state.food},
              {x: this.titles[3], y: this.state.other}
            ]}
            startAngle={0}
            endAngle={this.state.pieAngle}
            width={220} height={220}
            radius={100}
            colorScale={["blue", "yellow", "green", "pink"]}
          />
          <circle cx="110" cy="110" r="100" fill="none" stroke="black" strokeWidth="3"/>
        </svg>
        <BudgetControlPanel
          titles={this.titles}
          CO2eList={this.props.CO2eList}
          budgetLimit={this.monthlyBudget}
          handleChange={this.handleChange.bind(this)}
        />
        <button type="button">Tillbaka</button>
      </div>
    );
  }
}

class BudgetControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTab: "transport",
      budgetLeft: this.props.budgetLimit,
      sliderValue: 0
    };
    this.categories = [
      "transport",
      "housing",
      "food",
      "other"
    ]
  }

  tabClick(event) {
    this.setState({
      openTab: event.target.value,
    });
  }

  findIndexOfObject(CO2eObject) {
    for (let i in this.props.CO2eList[this.state.openTab]) {
      if (this.props.CO2eList[this.state.openTab][i].name == CO2eObject.name) {
        return i;
      }
    }
  }

  handleChange(event, CO2eObject) {
    var budgetLeft = this.state.budgetLeft;
    var moneyChange = event.target.value - CO2eObject.moneySpent;
    var co2eChange = moneyChange * CO2eObject.intensity;

    if (budgetLeft - co2eChange >= 0) {
      this.props.CO2eList[this.state.openTab][this.findIndexOfObject(CO2eObject)].moneySpent += moneyChange;
      budgetLeft -= co2eChange;
    }
    else {
      return;
    }

    let emissionsForCategory = {
      category: this.state.openTab,
      emissions: 0
    };
    for (let i in this.props.CO2eList[this.state.openTab]) {
      emissionsForCategory.emissions += this.props.CO2eList[this.state.openTab][i].co2eSpent();
    }

    // console.log("Budget left: " + budgetLeft);

    this.setState({
      budgetLeft: budgetLeft
    });
    this.props.handleChange(emissionsForCategory);
  }

  render() {
    let i = 0;
    let tabButtons = this.props.titles.map((title) =>
      <button value={this.categories[i++]} onClick={this.tabClick.bind(this)}>{title}</button>
    );

    let slidersForSpecificTab = this.props.CO2eList[this.state.openTab].map((CO2eObject) =>
      <div>
        <h3>{CO2eObject.display_name}</h3>
        <p>{CO2eObject.moneySpent} kr</p>
        <RangeInput
          stepSize="1"
          max={this.props.budgetLimit/CO2eObject.intensity}
          startValue={CO2eObject.moneySpent}
          handleChange={(e) => this.handleChange(e, CO2eObject)}
        />
      </div>
    );

    return (
      <div>
        {tabButtons}
        {slidersForSpecificTab}
      </div>
    );
  }
}


// THE WHOLE WEB APP
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 3,
      currentCO2e: 11,
      budgetLimit: 6,
    };
    this.CO2eList = {
      transport: [],
      housing: [],
      food: [],
      other: []
    };

    for (var prop in file) {
      var CO2eObject = file[prop];
      CO2eObject.moneySpent = 0;
      CO2eObject.co2eSpent = function(){
        return this.moneySpent*this.intensity;
      };
      switch(CO2eObject.chart_group) {
        case "transport":
          this.CO2eList.transport.push(CO2eObject);
          break;
        case "housing":
          this.CO2eList.housing.push(CO2eObject);
          break;
        case "food":
          this.CO2eList.food.push(CO2eObject);
          break;
        case "misc":
          this.CO2eList.other.push(CO2eObject);
          break;
        default:
          break;
      };
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
                        CO2eList={this.CO2eList}
                        budgetLimit={this.state.budgetLimit}
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
