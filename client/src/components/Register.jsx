import React, { Component } from 'react';
import axios from 'axios';

// Material-ui
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class Register extends Component {

  register(e) {
    e.preventDefault()

    console.log(e.target.pw.value, e.target['pw-check'].value)

    if (e.target.pw.value !== e.target['pw-check'].value) {
      alert('Wachtwoorden komen niet overeen')
      return
    }

    const data = {
      email: e.target.email.value,
      username: e.target.username.value,
      password: e.target.pw.value
    }

    axios.post('/api/register', data).then(res => {
      alert('Registreren is gelukt u kunt nu inloggen')
      this.props.login()
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
          <form onSubmit={this.register.bind(this)}>

            <DialogTitle id="form-dialog-title">Registreer</DialogTitle>
            <DialogContent>

              <TextField
                autoFocus
                margin="normal"
                id="email"
                label="Email Adres"
                type="email"
                fullWidth
                required
              />

              <TextField
                autoFocus
                margin="normal"
                id="username"
                label="Gebruikersnaam"
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

              <TextField
                autoFocus
                margin="normal"
                id="pw-check"
                label="Herhaal Wachtwoord"
                type="password"
                fullWidth
                required
              />

              <DialogContentText>
                Heb je al een account? log dan <span style={{ color: '#0000EE', textDecoration: 'underline', cursor: 'pointer' }} onClick={this.props.login}>
                  hier
                </span> in.
            </DialogContentText>

            </DialogContent>
            <DialogActions>
              <Button onClick={this.props.close} color="primary">
                Annuleer
            </Button>
              <Button type="submit" color="primary">
                Registreer
            </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default Register;