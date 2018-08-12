import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import YouTubePlayer from 'youtube-player';
import settings from '../../settings';
import MyContext from '../../MyContext';


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

var YouTube = require('youtube-node');
var youTube = new YouTube();
youTube.setKey(settings.youtube_key);

class Player extends Component {
  constructor(props) {
    super(props)
    this.state = {
      player: null,
      tab: 'chat',
      searchResult: []
    }

    if(!this.props.context.state.room)
      this.props.history.push('/')

    this.props.context.state.socket.emit('boi')

  }

  componentDidMount() {
    this.YouTubePlayerInit()
  }

  YouTubePlayerInit() {
    let player = YouTubePlayer('player', {
      // ADD VIDEO ID
      videoId: '',
      playerVars: {
        controls: 0,
        rel: 0,
        showinfo: 0
      }
    });

    this.setState({ player })
  }

  addToQueue(video) {
    this.props.context.state.socket.emit('addToQueue', {video, id: this.props.context.state.room.id})
  }

  search(e) {
    e.preventDefault();
    youTube.search(e.target['video-search'].value, 10, (err, result) => {
      if (err) { console.log(err); return }
      console.log(result)
      this.setState({ searchResult: result.items })
    });
  }

  changeTab = (event, tab) => {
    this.setState({ tab });
  };

  render() {
    return (
      <div>
        <Grid container spacing={16}>

          <Grid item xs={12} md={8}>

            <Card>

              <div id="player" style={{ width: '100%' }}></div>
              <CardContent>
                <Typography gutterBottom variant="headline" component="h2">
                  Lizard
          </Typography>
                <Typography component="p">
                  Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                  across all continents except Antarctica
          </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Share
          </Button>
                <Button size="small" color="primary">
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
                fullWidth
              >
                <Tab value="chat" label="chat" />
                <Tab value="queue" label="Wachtrij" />
              </Tabs>

              {this.state.tab === 'chat' &&
                <div>
                  chat
                </div>}

              {this.state.tab === 'queue' &&
                <div>
                  queue
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
                        <Button size="small" color="primary" onClick={this.addToQueue.bind(this, video)}>
                          Voeg toe
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>

                )
              })}
            </Grid>
          </Grid>

        </Grid>
      </div>
    );
  }
}


export default (props => (
  <MyContext.Consumer>
    {context => <Player {...props} context={context} />}
  </MyContext.Consumer>
))