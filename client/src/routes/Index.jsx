import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import MyContext from '../MyContext';

import Header from '../components/Header'

// ROUTES
import Home from './Home'
import Player from './Player/Player'

class Index extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div style={{margin: '10px'}}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/player/:id" component={Player} />
          {/* <Route component={NotFound} /> */}
        </Switch>
          </div>
      </React.Fragment>
    )
  }
}


export default (props => (
  <MyContext.Consumer>
    {context => <Index {...props} context={context} />}
  </MyContext.Consumer>
))