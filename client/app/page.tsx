"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useRef, useState } from "react";
import Player from "./components/Player";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import ChatBox , {ChatMessage} from "./components/ChatBox";


//constants for out room physics
const BOARD_SIZE = 500;
const DOT_SIZE = 25;
const STEP_SIZE = 25;


type PlayerPosition = {x : number , y : number , username?: string};


export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);
  const [username , setUsername] = useState<string>("");
  const [hasJoined , setHasJoined] = useState<boolean>(false);

  //humara local dot kaha pe hai
  const[position , setPosition] = useState({x : 0 , y : 0});
  // doosre players ko set karne ke liye
  const[otherPlayers , setOtherPlayers] = useState<Record<string , PlayerPosition>>({});


  const [messages , setMessages] = useState<ChatMessage[]>([]);

  // use a ref to hold the socket instance so it persists across renders
  const socketRef  = useRef<Socket | null>(null);


  // state to hold audio stream
  const[localStream , setLocalStream] = useState<MediaStream | null > (null);

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

  // handle keyboard movement
  useEffect(()=> {
    const handleKeyDown = (e : KeyboardEvent) => {
      //prevent browser from scrolling when using arrow keys
      if(["ArrowUp" , "ArrowDown" , "ArrowLeft" , "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        

        if(e.key == "ArrowUp") newY = Math.max(0 , prev.y - STEP_SIZE);
        if(e.key == "ArrowDown") newY = Math.min(BOARD_SIZE - DOT_SIZE , prev.y + STEP_SIZE);
        if(e.key == "ArrowLeft") newX = Math.max(0 , prev.x - STEP_SIZE);
        if(e.key == "ArrowRight") newX = Math.min(BOARD_SIZE - DOT_SIZE , prev.x + STEP_SIZE);


        //tell server that we moved !
        if(socketRef.current) {
          socketRef.current.emit("move" , {x : newX , y : newY})
        }

        return {x : newX , y : newY};
      });
    };

    window.addEventListener("keydown" , handleKeyDown);
    return () => window.removeEventListener("keydown" , handleKeyDown);
  } , []);


  // audio request
  const initialiseMedia = async() => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio : true,
        video : false
      });

      setLocalStream(stream);
      console.log("Microphone access granted !");
    } catch(err) {
      console.error("Error accessing microphone:" , err) ;
      alert("We need microphone access for proximity chat to work!")
    }
  }

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