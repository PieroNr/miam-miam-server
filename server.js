

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

class Room {
  constructor(id, endPoint, users, endTime) {
      this.id = id;
      this.endPoint = endPoint;
      this.users = users;
      this.endTime = endTime;
    }
}


const allClients = [];
const rooms = [];

app.get('/', (req, res) => {
  res.send('<h1>Hey Socket.io</h1>');
});

io.on('connection', (socket) => {
  let token = socket.handshake.auth.token;

  socket.on('leave', (roomId, user) => {
    
    
    
  });

  socket.on('disconnect', () => {

     
    const i = allClients.findIndex(e => (e.socket === socket));
    if(i !== -1){
      const indexRoom = rooms.findIndex(e => e.id === allClients[i].room)
      console.log(allClients[i].room, allClients[i].user)
      if(indexRoom !== -1){
      
      const userLeaving = rooms[indexRoom].users.findIndex(e => (e[0] === allClients[i].user))
      if(userLeaving !== -1){
        
        rooms[indexRoom].users.splice(userLeaving,1)
        
      }
      
      io.in(allClients[i].room).emit('updateRoom', rooms.find(e => (e.id === allClients[i].room)))
      io.in(allClients[i].room).emit('MESSAGE', {message: allClients[i].user._FirstName + " vient de quitter la room", status: "leave"})
      allClients.splice(i, 1);
    } 

    }
      
    
  });

  socket.on('addResto', (roomId,resto) => {
    
    io.in(roomId).emit('addResto', resto)
  });

  socket.on('changeResto', (roomId,listUserResto) => {
    const room =  rooms.findIndex(e => (e.id === roomId))
    if(room === -1) return
    const list = listUserResto.map(e => {
      return [e["User"], e["Resto"]]
    })
     
    rooms[room].users = list
    
    
    io.in(roomId).emit('changeResto', list)
    io.in(roomId).emit('updateRoom', rooms.find(e => (e.id === roomId)))
  });

  socket.on('changeUserCoord', (roomId, user, coord) => {
    const roomIndex = rooms.findIndex(e => (e.id === roomId))
    if(roomIndex !== -1){

      const userIndex = rooms[roomIndex].users.findIndex(e => (e[0].id === user.id))
      if(userIndex !== -1){
        rooms[roomIndex].users[userIndex][0]._coord = coord
        io.in(roomId).emit('updateRoom', rooms.find(e => (e.id === roomId)))
      }
    }
    
  })

  

  socket.on('changeFinish', (roomId, finish) => {
    
        rooms.find(e => (e.id === roomId)).endPoint = finish
        io.in(roomId).emit('updateRoom', rooms.find(e => (e.id === roomId)))

})
  socket.on("join", (roomId, user) => {
    allClients.push({socket: socket, user: user, room: roomId});
    console.log(roomId, user)
    socket.join(roomId);
    const indexRoom = rooms.findIndex(e => e.id === roomId)
    if(indexRoom !== -1){
      rooms[indexRoom].users.push([user, null])
     
    } else {
      let newRoom = new Room(roomId, [48.85385, 2.34822], [[user, null]], 13)
      rooms.push(newRoom)
    }
    
    io.in(roomId).emit('updateRoom', rooms.find(e => (e.id === roomId)))
    io.in(roomId).emit('MESSAGE', {message: user._FirstName + " vient de joindre la room", status: "join"})
    
    
  });

  

  socket.on('SEND_MESSAGE', function(data) {
    const mess = data.message
    const first = mess.split(' ')[0]
    if(first === "/endset"){
      const hour = mess.split(' ')[1]
      const indexRoom = rooms.findIndex(e => e.id === data.room)
      if(indexRoom === -1) return
      
      rooms[indexRoom].endTime = Number(hour)
      io.in(data.room).emit('updateRoom', rooms.find(e => (e.id === data.room)))
      io.in(data.room).emit('MESSAGE', {message: data.user._FirstName + " change l'heure d'arrivée : "+ hour, status: "change"})
      
    } else {
      io.in(data.room).emit('MESSAGE', data)
    }
    
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});