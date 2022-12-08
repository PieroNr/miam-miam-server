const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

let allUsers = [];
let endPoint;
let usersRestos ={};
let restos = {}
let roomUsers = [];

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

io.on('connection', (socket) => {
  let token = socket.handshake.auth.token;

  socket.on('newUser', user => {
    console.log(user)
    allUsers.push(user)
    io.emit('allUsers', allUsers)
    if (allUsers.length > 1 && endPoint) {
        io.emit('changeFinish', endPoint)
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('addResto', (resto) => {
    
    socket.broadcast.emit('addResto', resto)
  });

  socket.on('changeResto', (listUserResto) => {
    usersRestos = listUserResto
    console.log(listUserResto)
    socket.broadcast.emit('changeResto', listUserResto)
  });

  socket.on('changeFinish', (finish) => {
    console.log(finish)
    /* if (room !== ""){
        io.to(room).emit('changeFinishRoom',finish,room)
    }else{ */
        endPoint = finish;
        socket.broadcast.emit('changeFinish', finish)
        
    
})

  socket.on('SEND_MESSAGE', function(data) {
    io.emit('MESSAGE', data)
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});