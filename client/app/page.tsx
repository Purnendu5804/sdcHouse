"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useRef, useState } from "react";
import Player from "./components/Player";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import ChatBox , {ChatMessage} from "./components/ChatBox";
import { calculateDistance } from "./utils/distance";
import { useBoard } from "./hooks/useBoard";
import { useWebRTC } from "./hooks/useWebRTC"; // Note: conventionally hooks are lowercase 'useWebRTC'

//constants for out room physics
const BOARD_SIZE = 1080;
const BOARD_WIDTH = 1920;
const BOARD_HEIGHT = 2000;
const DOT_SIZE = 25;
const STEP_SIZE = 25;

const PROXIMITY_THRESHOLD = 35;

type PlayerPosition = {x : number , y : number , username?: string};

export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);
  const [username , setUsername] = useState<string>("");
  const [hasJoined , setHasJoined] = useState<boolean>(false);
  const [isChatOpen , setIsChatOpen] = useState<boolean>(false);

  // doosre players ko set karne ke liye
  const[otherPlayers , setOtherPlayers] = useState<Record<string , PlayerPosition>>({});

  const [messages , setMessages] = useState<ChatMessage[]>([]);

  // use a ref to hold the socket instance so it persists across renders
  const socketRef  = useRef<Socket | null>(null);

  // state to hold audio stream (Note: If this is inside useWebRTC now, you can remove it here)
  const[localStream , setLocalStream] = useState<MediaStream | null > (null);

  //socketId -> RTCPeerConnection
  //track active connection so we don't try to call the same person several times;
  // (Note: If this is inside useWebRTC now, you can remove it here)
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
  });
    
  //all the RTC logic (reduced)
  const { initialiseMedia } = useWebRTC({
    socketRef , 
    isConnected ,
    hasJoined,
    position, 
    otherPlayers
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white font-sans">
      
      {/* 1. LOBBY SCREEN OVERLAY */}
      {!hasJoined ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold mb-4 text-blue-400 tracking-tight">sdcHouse</h1>
            <p className="text-gray-400">Enter your name to join the virtual office.</p>
          </div>
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
        </div>
      ) : (
        
      /* 2. THE METAVERSE (MAIN UI) */
        <>
          {/* Base Layer: The Game Board fills the screen */}
          <div className="absolute inset-0 z-0 overflow-auto bg-[#0f172a]">
            <GameBoard 
              position={position}
              direction={direction}
              otherPlayers={otherPlayers}
              username={username}
              boardHeight={BOARD_HEIGHT}
              boardWidth={BOARD_WIDTH}
            />
          </div>

          {/* HUD Overlay: Top Left (Status & Branding) */}
          <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
            <div className="bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700 shadow-lg inline-block">
              <h1 className="text-xl font-bold text-blue-400">sdcHouse</h1>
            </div>
            <div className="bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg flex items-center gap-2 inline-flex w-max">
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-xs font-mono font-medium text-gray-300">
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </span>
            </div>
          </div>

          {/* HUD Overlay: Bottom Right (Action Buttons) */}
          <div className="absolute bottom-6 right-6 z-40 flex gap-3">
             <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-4 rounded-full shadow-xl transition-all flex items-center justify-center ${isChatOpen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-500'}`}
             >
                {/* A simple message icon using pure CSS shapes */}
                <div className="w-5 h-5 bg-white rounded-sm relative before:absolute before:w-0 before:h-0 before:border-l-4 before:border-r-4 before:border-t-4 before:border-transparent before:border-t-white before:-bottom-1 before:left-1" />
             </button>
          </div>

          {/* HUD Overlay: The Chat Drawer */}
          {isChatOpen && (
            <div className="absolute bottom-24 right-6 z-50 w-80 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200">
              <ChatBox
                messages={messages}
                onSendMessage={(text) => socketRef.current?.emit("sendChat" , text)}
                localSocketId={socketRef.current?.id}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}