import React, { Component } from 'react';
import MyContext from '../MyContext';
import axios from 'axios';

import Register from './Register'
import Login from './Login';

// Material-ui
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Icon from '@material-ui/core/Icon';

class Header extends Component {
  state = {
    anchorEl: null,
    menuOpen: false,
    register: false
  }

  logOut() {
    this.props.context.changeValue('user', null)
    axios.defaults.headers.common["token"] = '';
  }

  render() {
    let menuItems;

    if(!this.props.context.state.user) {
      menuItems = [
        <MenuItem key={'login'} onClick={() => this.setState({ menuOpen: false, login: true })}>Inloggen</MenuItem>,
        <MenuItem key={'register'} onClick={() => this.setState({ menuOpen: false, register: true })}>Registreren</MenuItem>
      ]
    } else {
      menuItems = [
        <MenuItem key={'logout'} onClick={this.logOut.bind(this)}>Uitloggen</MenuItem>
      ]
    }

    return (
      <React.Fragment>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit" style={{ flexGrow: 1 }}>
              Watch It Together
            </Typography>
            <div>
              {this.props.context.state.user && this.props.context.state.user.username}
              <IconButton
                aria-owns={'menu-appbar'}
                aria-haspopup="true"
                onClick={() => this.setState({ menuOpen: true })}
                color="inherit"
              >
                <Icon>account_circle</Icon>

              </IconButton>



              <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                style={{ marginTop: '-5px' }}
                open={this.state.menuOpen}
                onClose={() => this.setState({ menuOpen: false })}
              >
                {menuItems}
              </Menu>


            </div>

          </Toolbar>
        </AppBar>


        {this.state.register &&
          <Register
            close={() => this.setState({ register: false })}
            login={() => this.setState({ register: false, login: true })}
          />}

        {this.state.login &&
          <Login
            close={() => this.setState({ login: false })}
          />}


      </React.Fragment>
    );
  }
}

export default (props => (
  <MyContext.Consumer>
    {context => <Header {...props} context={context} />}
  </MyContext.Consumer>
))