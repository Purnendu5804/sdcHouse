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

  // wait for the user to submit their name from the Lobby , and now they have to submit their color also
  socket.on('join', (userData) => {
    const isObject = typeof userData === "object";
    players[socket.id] = {
      x : 0,
      y : 0,
      username : isObject ? userData.username : userData,
      avatarId : isObject ? userData.avatarId : "avatar_1",
      direction: 'down' //default direction
    };
    io.emit('stateUpdate' , players);
    console.log(`${userData.username} joined sdcHouse `)
  });

  // socket.on('move' , (newPosition) => {
  //   players[socket.id] = newPosition;
  //   io.emit('stateUpdate' , players);
  // });

  socket.on("move" , (newPosition) => {
    if(players[socket.id]) {
      players[socket.id] = {
        ...players[socket.id],
        x : newPosition.x,
        y : newPosition.y,
        direction : newPosition.direction || players[socket.id].direction
      };
      io.emit('stateUpdate' , players)
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


  //A wants to talk to B
  socket.on("askToTalk" , ({targetId , senderName}) => {

    //send private message to target player
    io.to(targetId).emit("incomingRequest" , {
      id : socket.id,
      name : senderName
    })
  });

  //B accepts the request
  socket.on("acceptTalk" , ({targetId}) => {
    io.to(targetId).emit("requestAccepted" , {
      id : socket.id
    });



    //we will add the RTC bubble logic here
  })




  //webRTC logic 

  //passing the offer
  socket.on('webrtc-offer' , ({targetId , offer}) => {
    //send it privately to the target
    io.to(targetId).emit("webrtc-offer" , {
      senderId : socket.id,
      offer : offer
    })
  })

  //passing the answer to the offer
  socket.on('webrtc-answer' , ({targetId , answer}) => {
    io.to(targetId).emit('webrtc-answer' , {
      senderId : socket.id,
      answer : answer
    })
  })

  //passing the ICE candidates 
  socket.on('webrtc-ice-candidate' , ({targetId , candidate}) => {
    io.to(targetId).emit('webrtc-ice-candidate' , {
      senderId : socket.id,
      candidate : candidate
    })
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