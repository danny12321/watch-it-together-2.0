import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

// ROUTES
import Home from './Home'


export default class Index extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        {/* <Route component={NotFound} /> */}
      </Switch>
    )
  }
}
