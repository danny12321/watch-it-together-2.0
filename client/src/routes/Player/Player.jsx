import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import YouTubePlayer from 'youtube-player';
import settings from '../../settings';
import MyContext from '../../MyContext';
import axios from 'axios';

// Material-ui
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(settings.youtube_key);

// eslint-disable-next-line
let player;

class Player extends Component {

  constructor(props) {
    super(props)
    this.state = {
      player: null,
      tab: 'queue',
      searchResult: [],
      isPlaying: false,
      time: 0,
      dragging: false,
      duration: 0,
      addToPlaylist: null,
      selectPlaylist: '',
      createPlaylist: false,
      expandPanel: ''
    }

    const socket = this.props.context.state.socket

    socket.on('updateRoom', room => {
      let body, icon;

      if (!room.queue.length) {
        icon = 'https://www.shareicon.net/data/2015/12/31/226106_roll_256x256.png'
        body = 'Dit is de laatste video die in wachtrij staat. Voeg snel nieuwe videos toe!'
      } else if (this.props.context.state.room && room.queue.length > this.props.context.state.room.queue.length) {
        icon = room.queue[room.queue.length - 1].snippet.thumbnails.high.url
        body = `${room.queue[room.queue.length - 1].snippet.title} is toegevoegd`
      } else {
        icon = room.queue[0].snippet.thumbnails.high.url
        body = `Je luisterd nu naar ${room.queue[0].snippet.title} van ${room.queue[0].snippet.channelTitle}`
      }

      if (Notification.permission !== "granted")
        Notification.requestPermission();
      else {
        var notification = new Notification('Hekkie.ddns.net', {
          icon,
          body
        });

        notification.onclick = () => {

        }

        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // CHANGE THE DOCUMENT TITLE
      document.title = `${room.queue[0].snippet.title} - ${room.queue[0].snippet.channelTitle}`;

      // CHANGES FAVICON
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = room.queue[0].snippet.thumbnails.high.url;
      document.getElementsByTagName('head')[0].appendChild(link);

      this.props.context.changeValue('room', room)
    })

    socket.on('nextVideo', videoId => {
      player.loadVideoById(videoId)
      player.getDuration().then(duration => {
        this.setState({ duration })
      })
    })

    socket.on('pause', () => {
      player.pauseVideo()
    })

    socket.on('play', time => {
      player.seekTo(time)
      player.playVideo()
    })
  }


  componentDidMount() {
    if (this.props.context.state.room)
      this.YouTubePlayerInit()


    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chromium.');
      return;
    }

    if (Notification.permission !== "granted")
      Notification.requestPermission();
  }

  YouTubePlayerInit() {
    player = YouTubePlayer('player', {
      // ADD VIDEO ID
      videoId: '',
      playerVars: {
        controls: 0,
        rel: 0,
        showinfo: 0
      }
    });

    setInterval(() => {
      if (!this.state.dragging) {
        player.getCurrentTime().then(time => {
          this.setState({ time: Math.round(time) })
        })

        player.getDuration().then(duration => {
          this.setState({ duration: Math.round(duration) })
        })
      }
    }, 1000)

    player.on('stateChange', e => {
      const context = this.props.context.state
      if (e.data === 0) {
        // ended
        if (context.room.head === context.socket.id) {
          context.socket.emit('nextVideo', context.room.id)
        }
      } else if (e.data === 1) {
        // play
        this.setState({ isPlaying: true })
      } else if (e.data === 2) {
        // paused
        this.setState({ isPlaying: false })

      } else if (e.data === 3) {
        // buffering
      }
    })
  }

  playVideo() {
    const { id } = this.props.context.state.room
    player.getCurrentTime().then(time => {
      this.props.context.state.socket.emit('playVideo', time, id)
    })
  }

  pauseVideo() {
    const { id } = this.props.context.state.room
    this.props.context.state.socket.emit('pauseVideo', id)
  }

  seekTo(seekTo) {
    const { id } = this.props.context.state.room
    this.setState({ dragging: false })
    this.props.context.state.socket.emit('playVideo', seekTo, id)
  }

  nextVideo() {
    const { id } = this.props.context.state.room
    this.props.context.state.socket.emit('nextVideo', id)
  }

  addToQueue(video) {
    this.props.context.state.socket.emit('addToQueue', { video, id: this.props.context.state.room.id })
  }

  deleteVideo(video) {
    this.props.context.state.socket.emit('deleteVideo', video, this.props.context.state.room.id)
  }

  search(e) {
    e.preventDefault();
    youTube.search(e.target['video-search'].value, 10, (err, result) => {
      if (err) { console.log(err); return }
      this.setState({ searchResult: result.items })
    });
  }

  changeTab = (event, tab) => {
    this.setState({ tab });
  };

  addToPlaylist() {
    if (this.state.selectPlaylist === '') {
      this.setState({ createPlaylist: true })
    } else {
      axios.post('/api/addtoplaylist', { video: this.state.addToPlaylist, playlist: this.state.selectPlaylist }).then(res => {
        this.setState({ addToPlaylist: false, selectPlaylist: '' })

        let user = this.props.context.state.user.playlists;
        user.playlists = res.data;
        this.props.context.changeValue('user', user)
      })
    }
  }

  createPlaylist(e) {
    e.preventDefault()
    const name = e.target.name.value

    axios.post('/api/createPlaylist', { name, video: this.state.addToPlaylist }).then(res => {
      this.setState({ addToPlaylist: null, createPlaylist: false, selectPlaylist: '' })

      let user = this.props.context.state.user.playlists;
      user.playlists = res.data;
      this.props.context.changeValue('user', user)
    })
  }

  addPlaylistToQueue(playlist) {
    playlist.videos.forEach(video => {
      this.addToQueue({
        id: video.videoId,
        snippet: {
          title: video.name,
          channelTitle: video.channelTitle,
          description: video.description,
          thumbnails: {
            high: {
              url: video.img
            }
          }
        }
      })
    })
  }

  fancyTimeFormat(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }

  render() {
    if (!this.props.context.state.room) {
      this.props.history.push('/')
      return null
    }

    const current = this.props.context.state.room.queue[0] || {
      snippet: {
        title: "Geen video gevonden",
        channelTitle: 'hekkie.ddns.net',
        description: 'Voeg een video toe'
      }
    }


    return (
      <div>
        <Grid container spacing={16}>

          <Grid item xs={12} md={8}>

            <Card>

              <div style={{ position: 'relative' }}>

                <div id="player" style={{ width: '100%' }}> </div>

                <div className="playerControls" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>

                  <div style={{ color: 'white', position: 'absolute', bottom: 0, left: '10px', right: '10px' }}>
                    <Grid container>
                      <Grid item md={2} sm={3} xs={5}>

                        {this.state.isPlaying ?
                          <Icon onClick={this.pauseVideo.bind(this)} style={{ verticalAlign: 'middle' }}>pause</Icon> :
                          <Icon onClick={this.playVideo.bind(this)} style={{ verticalAlign: 'middle' }}>play_arrow</Icon>}

                        <Icon onClick={this.nextVideo.bind(this)} style={{ verticalAlign: 'middle' }}>skip_next</Icon>

                        <p style={{ width: '70px', display: 'inline-block', textAlign: 'center', verticalAlign: 'middle' }}>
                          {this.fancyTimeFormat(this.state.time)}/{this.fancyTimeFormat(this.state.duration)}
                        </p>
                      </Grid>

                      <Grid item md={10} sm={9} xs={7} style={{ display: 'flex', verticalAlign: 'middle' }}>
                        <input
                          type="range"
                          min={0}
                          step={1}
                          max={this.state.duration}
                          value={this.state.time}
                          style={{ width: '80%' }}
                          onChange={e => this.setState({ time: e.target.value, dragging: true })}
                          onMouseUp={e => this.seekTo(e.target.value)}
                        />

                        <input
                          type="range"
                          min={0}
                          step={1}
                          max={100}
                          style={{ width: '20%' }}
                          onChange={e => player.setVolume(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </div>
                </div>
              </div>

              <CardContent>
                <Typography gutterBottom variant="headline" component="h2">
                  {current.snippet.title} - {current.snippet.channelTitle}
                </Typography>
                <Typography component="p">
                  {current.snippet.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Share
          </Button>
                <Button size="small" color="primary" onClick={() => this.nextVideo()}>
                  Volgende
          </Button>
              </CardActions>
            </Card>

          </Grid>

          <Grid item xs={12} md={4}>
            <AppBar position="static" color="default">
              <Tabs
                value={this.state.tab}
                onChange={this.changeTab}
                indicatorColor="primary"
                textColor="primary"
                // fullWidth
                scrollable
                scrollButtons="auto"
              >
                <Tab value="queue" label="Wachtrij" />
                <Tab value="playlist" label="afspeellijsten" />
                <Tab value="chat" disabled label="chat" />
                <Tab value="info" disabled label="info" />
              </Tabs>

              {this.state.tab === 'chat' &&
                <div>
                  chat
                </div>}

              {this.state.tab === 'queue' &&
                <div>
                  <List>
                    {this.props.context.state.room.queue.map((video, key) => {
                      return (
                        <ListItem>
                          <Avatar style={{ width: '70px', height: '70px', background: 'black' }}>
                            <img width="100%" src={video.snippet.thumbnails.high.url} alt={video.snippet.title} />
                          </Avatar>
                          <ListItemText primary={video.snippet.title} secondary={video.snippet.channelTitle} />
                          <Icon onClick={this.deleteVideo.bind(this, key)} style={{ float: 'right', cursor: 'pointer' }}>delete</Icon>
                        </ListItem>
                      )
                    })}
                  </List>
                </div>}

              {this.state.tab === 'playlist' &&
                <div>
                  <List>
                    {this.props.context.state.user ? this.props.context.state.user.playlists.map((playlist, key) => {
                      return (
                        <ExpansionPanel expanded={this.state.expandPanel === playlist.id} onChange={() => {
                          this.setState({ expandPanel: this.state.expandPanel === playlist.id ? '' : playlist.id })
                        }
                        }>
                          <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
                            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, fontWeight: 'bold' }}>{playlist.name}</Typography>
                            <Typography>{playlist.owner}</Typography>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails>
                            <div style={{width: '100%'}}>

                              <Button style={{ float: 'right' }} size="small" color="primary" onClick={this.addPlaylistToQueue.bind(this, playlist)}>
                                Toevoegen aan wachtrij <Icon>add_to_queue</Icon>
                              </Button>


                              <Typography>
                                {playlist.videos.map(video => {
                                  return (
                                    <ListItem>
                                      <Avatar style={{ width: '70px', height: '70px', background: 'black' }}>
                                        <img width="100%" src={video.img} alt={video.title} />
                                      </Avatar>
                                      <ListItemText primary={`${video.name} - ${video.channelTitle}`} secondary={video.addedBy} />
                                      <Icon style={{ float: 'right', cursor: 'pointer' }}>delete</Icon>
                                    </ListItem>
                                  )
                                })}
                              </Typography>
                            </div>
                          </ExpansionPanelDetails>
                        </ExpansionPanel>
                      )
                    }) : <span>Je moet ingelogd zijn om je afspeellijsten te kunnen zien</span>}
                  </List>
                </div>}
            </AppBar>

          </Grid>

          <Grid item xs={12}>
            <form onSubmit={this.search.bind(this)}>
              <input type="text" name="video-search" />
              <button type="submit">Zoek</button>
            </form>


            <Grid container spacing={16}>
              {this.state.searchResult.map(video => {
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={video.id.videoId}>
                    <Card>
                      <CardMedia
                        style={{
                          height: 0,
                          paddingTop: '56.25%'
                        }}
                        image={video.snippet.thumbnails.high.url}
                        title="Contemplative Reptile"
                      />
                      <CardContent>
                        <Typography gutterBottom variant="headline" component="h2">
                          {video.snippet.title} - <span>{video.snippet.channelTitle}</span>
                        </Typography>
                        <Typography component="p">
                          {video.snippet.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <span>
                          {new Date(video.snippet.publishedAt).toLocaleString()}
                        </span>
                        {this.props.context.state.user &&
                          <Button size="small" color="primary" onClick={() => this.setState({ addToPlaylist: video })}>
                            <Icon>playlist_add</Icon>
                            Afspeellijst
                        </Button>}
                        <Button size="small" color="primary" onClick={this.addToQueue.bind(this, video)}>
                          <Icon>add_to_queue</Icon>
                          Wachtrij
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>

                )
              })}
            </Grid>
          </Grid>

        </Grid>


        {this.state.addToPlaylist && (
          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            maxWidth="xs"
            onEntering={this.handleEntering}
            aria-labelledby="confirmation-dialog-title"
            open={true}
          >
            <DialogTitle id="confirmation-dialog-title">Voeg toe aan afspeellijst</DialogTitle>
            <DialogContent>
              <RadioGroup
                ref={ref => {
                  this.radioGroupRef = ref;
                }}
                aria-label="Ringtone"
                name="ringtone"
                value={this.state.selectPlaylist}
                onChange={e => this.setState({ selectPlaylist: e.target.value })}
              >
                <FormControlLabel value={''} key={'new'} control={<Radio />} label={'Nieuwe afspeellijst'} />
                {this.props.context.state.user.playlists.map(playlist => (
                  <FormControlLabel value={`${playlist.id}`} key={playlist.id} control={<Radio />} label={playlist.name} />
                ))}
              </RadioGroup>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ addToPlaylist: null })} color="primary">
                Cancel
            </Button>
              <Button onClick={this.addToPlaylist.bind(this)} color="primary">
                Toevoegen
            </Button>
            </DialogActions>
          </Dialog>
        )}

        {this.state.createPlaylist && (
          // TODO ADD IMAGE
          <Dialog
            open={true}
            onClose={() => this.setState({ createPlaylist: false })}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Maak afspeellijst</DialogTitle>
            <form onSubmit={this.createPlaylist.bind(this)}>

              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Naam"
                  type="text"
                  fullWidth
                />

              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.setState({ createPlaylist: false, })} color="primary">
                  Annuleer
            </Button>
                <Button type="submit" color="primary">
                  Maak
            </Button>
              </DialogActions>
            </form>
          </Dialog>
        )}
      </div>
    );
  }
}


export default (props => (
  <MyContext.Consumer>
    {context => <Player {...props} context={context} />}
  </MyContext.Consumer>
))