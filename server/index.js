import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server , {
  cors : {
    origin: "http://localhost:3000",
    methods: ["GET" , "POST"]
  }
});

//this is our temp db
const players = {};

io.on('connection' , (socket) => {
  console.log(`User Connected : ${socket.id}`);

  // //add new player to our players obj

  // wait for the user to submit their name from the Lobby
  socket.on('join', (username) => {
    players[socket.id] = { x: 0, y: 0, username: username };
    io.emit('stateUpdate', players);
    console.log(`${username} joined sdcHouse!`);
  });

  // socket.on('move' , (newPosition) => {
  //   players[socket.id] = newPosition;
  //   io.emit('stateUpdate' , players);
  // });

  socket.on("move" , (newPosition) => {
    if(players[socket.id]) {
      players[socket.id].x = newPosition.x;
      players[socket.id].y = newPosition.y;
      io.emit('stateUpdate' , players);
    }
  });

  //listening chat message
  socket.on("sendChat" ,(text) => {
    if(players[socket.id]) { // checking players exist
      const messageData = {
        id : socket.id,
        name : players[socket.id].username,
        text : text,
        //clean time format
        time : new Date().toLocaleTimeString([] , {hour : '2-digit' , minute: '2-digit'})
      };

      io.emit('newChat' , messageData);
    }
  })

  socket.on('disconnect' , () => {
    console.log(`User Disconnected : ${socket.id}`);
    delete players[socket.id];
    io.emit('stateUpdate' , players);
  });
});

server.listen(3001 , () =>{
  console.log('sdcHouse server running on port 3001');
}) 