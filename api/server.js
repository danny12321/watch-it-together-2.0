// ENV VARS
require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)
const bodyParser = require('body-parser');
const func = require('./functions')

// ROUTES
const api = require('./routes/api');

// Add headers
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,userId,userToken,userid,usertoken,banaan');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

// Body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


app.use('/api', api);

const rooms = {}

io.on('connection', socket => {

  socket.on('createRoom', (req, callback) => {
    randomId(id => {
      const room = { id, name: func.escapeHtml(req.name), head: socket.id, sockets: [socket.id], queue: [] }

      rooms[id] = room;

      socket.join(room.id);

      callback(room)
      io.emit('newRooms', rooms)
    });
  })

  socket.on('getRooms', callback => callback(rooms))

  socket.on('joinRoom', (req, callback) => {
    socket.join(req.id);
    rooms[req.id].sockets.push(socket.id)
    callback(rooms[req.id])
    io.emit('newRooms', rooms)
  })


  socket.on('addToQueue', (req) => {
    rooms[req.id].queue.push(req.video)
    io.to(req.id).emit('updateRoom', rooms[req.id])


    if (rooms[req.id].queue.length === 1)
      io.to(req.id).emit('nextVideo', rooms[req.id].queue[0].id)
  })

  socket.on('deleteVideo', (index, roomId) => {
    rooms[roomId].queue.splice(index, 1);
    if (index === 0) {
      if (!rooms[roomId].queue[0])
        rooms[roomId].queue.push({
          id: 'oT3mCybbhf0',
          snippet: {
            title: "Voeg dan toch een liedje toe!",
            channelTitle: 'Love from hekkie.ddns.net',
            description: "Yeah, let's go",
            thumbnails: {
              high: {
                url: 'https://www.shareicon.net/data/2015/12/31/226106_roll_256x256.png'
              }
            }
          }
        })
        
      io.to(roomId).emit('nextVideo', rooms[roomId].queue[0].id)
    }

    io.to(roomId).emit('updateRoom', rooms[roomId])
  })

  socket.on('pauseVideo', roomId => {
    io.to(roomId).emit('pause')
  })

  socket.on('playVideo', (time, roomId) => {
    io.to(roomId).emit('play', time)
  })

  socket.on('nextVideo', roomId => {
    rooms[roomId].queue.shift()
    if (!rooms[roomId].queue[0])
      rooms[roomId].queue.push({
        id: 'oT3mCybbhf0',
        snippet: {
          title: "Voeg dan toch een liedje toe!",
          channelTitle: 'Love from hekkie.ddns.net',
          description: "Yeah, let's go",
          thumbnails: {
            high: {
              url: 'https://www.shareicon.net/data/2015/12/31/226106_roll_256x256.png'
            }
          }
        }
      })

    io.to(roomId).emit('nextVideo', rooms[roomId].queue[0].id)
    io.to(roomId).emit('updateRoom', rooms[roomId])
  })

  socket.on('disconnecting', () => {
    delete socket.rooms[socket.id]


    for (let room in socket.rooms) {
      let index = rooms[room].sockets.findIndex(id => id === socket.id);
      rooms[room].sockets.splice(index, 1)

      if (!rooms[room].sockets.length)
        delete rooms[room]
      else if (rooms[room].head === socket.id) {
        // CHECK IF THE SOCKET WAS THE HEAD OF THE ROOM
         rooms[room].head = rooms[room].sockets[0]
         io.to(room).emit('updateRoom', rooms[room])
      }

      io.emit('newRooms', rooms)
    }
  })
})

function randomId(callback) {
  let token = makeToken();
  if (rooms[token])
    randomId(callback)
  else
    callback(token)
}

function makeToken() {
  let token = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 10; i++) {
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return token
}


http.listen(5500, err => {
  if (err) throw err
  console.log('server is listening')
})