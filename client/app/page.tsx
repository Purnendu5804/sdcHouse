"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useRef, useState } from "react";
import Player from "./components/Player";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import ChatBox , {ChatMessage} from "./components/ChatBox";
import { calculateDistance } from "./utils/distance";
import { useBoard } from "./hooks/useBoard";
import { UseWebRTC } from "./hooks/useWebRTC";



//constants for out room physics
const BOARD_SIZE = 500;
const DOT_SIZE = 25;
const STEP_SIZE = 25;


const PROXIMITY_THRESHOLD = 35;


type PlayerPosition = {x : number , y : number , username?: string};


export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);
  const [username , setUsername] = useState<string>("");
  const [hasJoined , setHasJoined] = useState<boolean>(false);



  // doosre players ko set karne ke liye
  const[otherPlayers , setOtherPlayers] = useState<Record<string , PlayerPosition>>({});


  const [messages , setMessages] = useState<ChatMessage[]>([]);

  // use a ref to hold the socket instance so it persists across renders
  const socketRef  = useRef<Socket | null>(null);


  // state to hold audio stream
  const[localStream , setLocalStream] = useState<MediaStream | null > (null);

  //socketId -> RTCPeerConnection
  //track active connection so we don't try to call the same person several times;

  const peersRef = useRef<Map<String , RTCPeerConnection>>(new Map());

useEffect(() => {

  // connect inside the component lifecycle
  socketRef.current = io("http://localhost:3001");
  socketRef.current.on("connect" , () => setIsConnected(true));
  socketRef.current.on("disconnect" , () => setIsConnected(false));

  //listen the master list of players from the server
  socketRef.current.on("stateUpdate" , (players : Record<string , PlayerPosition>) => {
    const playersCopy = {...players};
    // remove ourselves from this copy
    if (socketRef.current?.id) {
      delete playersCopy[socketRef.current.id];
    }
    setOtherPlayers(playersCopy);
  });

  //listen for new chat
  socketRef.current.on("newChat" ,(msg : ChatMessage) => {
    setMessages((prev) => [...prev , msg]);
  })

  // CRITICAL: Clean up the connection when Next.js reloads the component
  // ye hot fast refresh se connection band karne ke liye
    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("newChat");
    };
} , []);

// keyboard logic
const { position , direction} = useBoard({
  BOARD_SIZE,
  STEP_SIZE,
  DOT_SIZE,
  hasJoined,
  onMove : (newPos) => {
    socketRef.current?.emit("move" , newPos);
  }
})
  

//all the RTC logic (reduced)

const { initialiseMedia } = UseWebRTC({
  socketRef , 
  isConnected ,
  hasJoined,
  position, 
  otherPlayers
});


 return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-center text-blue-400">sdcHouse</h1>
        <p className="text-center text-sm font-mono bg-gray-800 p-2 rounded">
          Network: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
      </div>

      {!hasJoined ? (
        <Lobby 
          username={username}
          setUsername={setUsername}
          onJoin={() => {
            if (username.trim()) {
              socketRef.current?.emit("join" , username);
              setHasJoined(true);
              // ask for mic permission right after joining
              initialiseMedia();
            }
          }}
        />
      ) : (
        <div className="flex flex-row items-start justify-center">
          <GameBoard 
          position={position}
          direction={direction}
          otherPlayers={otherPlayers}
          username = {username}
          boardSize={BOARD_SIZE}
        />

        <ChatBox
          messages={messages}
          onSendMessage={(text) => socketRef.current?.emit("sendChat" , text)}
          localSocketId={socketRef.current?.id}
        />
        </div>
        
      
      )}
    </div>
  );
}