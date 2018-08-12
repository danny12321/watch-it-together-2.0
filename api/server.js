const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

const rooms = {}

io.on('connection', socket => {
  console.log('I have a connection!')

  socket.on('createRoom', (req, callback) => {
    randomId(id => {
      const room = { id, name: req.name, sockets: [socket.id], queue: [] }

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


  socket.on('addToQueue', (VideoPlaybackQuality, id) => {

  })

  socket.on('disconnecting', () => {
    console.log('bye')

    delete socket.rooms[socket.id]
    console.log(socket.rooms)


    for (let room in socket.rooms) {
      let index = rooms[room].sockets.findIndex(id => id === socket.id);
      rooms[room].sockets.splice(index, 1)

      if (!rooms[room].sockets.length)
        delete rooms[room]

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


http.listen(5000, err => {
  if (err) throw err
  console.log('server is listening')
})