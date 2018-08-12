import React, { Component } from 'react';
import MyContext from '../MyContext';

// Material-ui
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rooms: [],
      tab: 'join'
    }

    // LOAD ALL ROOMS
    this.props.context.state.socket.on('newRooms', rooms => this.roomsToState(rooms))
  }

  componentDidMount() {
    this.fetchRooms()
  }

  fetchRooms() {
    this.props.context.state.socket.emit('getRooms', rooms => this.roomsToState(rooms))
  }

  roomsToState(rooms) {
    let stateRooms = []

    for (let room in rooms) {
      stateRooms.push(rooms[room])
    }

    this.setState({ rooms: stateRooms })
  }

  changeTab = (event, tab) => {
    this.setState({ tab });
  };


  createRoom(e) {
    e.preventDefault()
    const name = e.target['room-name'].value

    this.props.context.state.socket.emit('createRoom', { name }, room => {
      this.props.context.changeValue('room', room)
      this.props.history.push(`/player/${room.id}`)
    })
  }

  joinRoom(id) {
    this.props.context.state.socket.emit('joinRoom', {id}, room => {
      this.props.context.changeValue('room', room)
      this.props.history.push(`/player/${room.id}`)
    })
  }

  render() {
    return (
      <div>
        <h2>Home</h2>

        <Paper>
          <Tabs
            value={this.state.tab}
            onChange={this.changeTab}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab value="join" label="Join" />
            <Tab value="create" label="Maak" />
          </Tabs>


          {this.state.tab === 'join' &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>id</TableCell>
                  <TableCell>Naam</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.rooms.map(n => {
                  return (
                    <TableRow key={n.id}>
                      <TableCell component="th" scope="row">
                        {n.id}
                      </TableCell>
                      <TableCell>{n.name}</TableCell>
                      <TableCell>
                        <Button color="primary" onClick={this.joinRoom.bind(this, n.id)}>
                          Join
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>}


          {this.state.tab === 'create' &&
            <Grid container spacing={24} justify="center">
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <form onSubmit={this.createRoom.bind(this)}>

                  <TextField
                    name="room-name"
                    label="Naam"
                    margin="normal"
                  />

                  <Button color="primary" type="submit">
                    Maak
                </Button>
                </form>

              </Grid>
            </Grid>

          }
        </Paper>
      </div>
    );
  }
}

export default (props => (
  <MyContext.Consumer>
    {context => <Home {...props} context={context} />}
  </MyContext.Consumer>
))