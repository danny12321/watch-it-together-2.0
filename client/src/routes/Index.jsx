import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

// ROUTES
import Home from './Home'
import Player from './Player/Player'

export default class Index extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/player/:id" component={Player} />
        {/* <Route component={NotFound} /> */}
      </Switch>
    )
  }
}
