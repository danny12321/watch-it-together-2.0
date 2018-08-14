import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom'

import MyContext from './MyContext';

import Routes from './routes/Index';
const io = require('socket.io-client');

let socket
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') 
  socket = io.connect(`http://${window.location.hostname}:5500`);
else
  socket = io();

class MyProvider extends Component {
  state = {
    user: null,
    socket,
    room: null,
    playlist: []
  }

  render() {
    return (
      <MyContext.Provider value={{
        state: this.state,
        changeValue: (element, value, callback) => {
          this.setState({ [element]: value }, callback);
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
