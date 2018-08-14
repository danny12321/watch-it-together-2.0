import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../MyContext'

// Material-ui
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class Login extends Component {

  login(e) {
    e.preventDefault()

    const data = {
      emailusername: e.target.emailemailusername.value,
      password: e.target.pw.value
    }

    axios.post('/api/login', data).then(res => {
      this.props.context.changeValue('user', res.data)
      axios.defaults.headers.common["token"] = `${res.data.jwt}`;
      this.props.close()
    })
  }

  render() {
    return (
      <div>
        <Dialog
          open={true}
          onClose={this.props.close}
          aria-labelledby="form-dialog-title"
        >
          <form onSubmit={this.login.bind(this)}>

            <DialogTitle id="form-dialog-title">Login</DialogTitle>
            <DialogContent>

              <TextField
                autoFocus
                margin="normal"
                id="emailemailusername"
                label="Email Adres of Gebruikersnaam"
                type="text"
                fullWidth
                required
              />

              <TextField
                autoFocus
                margin="normal"
                id="pw"
                label="Wachtwoord"
                type="password"
                fullWidth
                required
              />

            </DialogContent>
            <DialogActions>
              <Button onClick={this.props.close} color="primary">
                Annuleer
            </Button>
              <Button type="submit" color="primary">
                Login
            </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default (props => (
  <MyContext.Consumer>
    {context => <Login {...props} context={context} />}
  </MyContext.Consumer>
))