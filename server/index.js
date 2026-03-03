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

  //add new player to our players obj
  players[socket.id] = {x : 0 , y : 0};
  io.emit('stateUpdate' , players) // tell everyone

  socket.on('move' , (newPosition) => {
    players[socket.id] = newPosition;
    io.emit('stateUpdate' , players);
  });

  socket.on('disconnect' , () => {
    console.log(`User Disconnected : ${socket.id}`);
    delete players[socket.id];
    io.emit('stateUpdate' , players);
  });
});

server.listen(3001 , () =>{
  console.log('sdcHouse server running on port 3001');
})