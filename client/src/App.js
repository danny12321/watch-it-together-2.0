import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom'

import MyContext from './MyContext';

import Routes from './routes/Index';

class MyProvider extends Component {
  state = {

  }

  render() {
    return (
      <MyContext.Provider value={{
        state: this.state,
        changeValue: (element, value) => {
          this.setState({ [element]: value });
        },
      }}>
        {this.props.children}
      </MyContext.Provider>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <MyProvider>
          <Router>
            <Routes />
          </Router>
        </MyProvider>
      </div>
    );
  }
}

export default App;
