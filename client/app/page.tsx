"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import Lobby from "./components/Lobby";
import GameBoard, { MapObject } from "./components/GameBoard";
import ChatBox, { ChatMessage } from "./components/ChatBox";
import PlayerList from "./components/PlayerList"; // Make sure to create this component!
import { calculateDistance } from "./utils/distance";
import { useBoard } from "./hooks/useBoard";
import { useWebRTC } from "./hooks/useWebRTC";
//constants for out room physics
const BOARD_WIDTH = 1470;
const BOARD_HEIGHT = 800;
const DOT_SIZE = 25;
const STEP_SIZE = 25;

const PROXIMITY_THRESHOLD = 35;

export const MAP_OBJECTS: MapObject[] = [
  // center meeting table
  { id: 'center_table', x: 685, y: 350, width: 100, height: 100, type: 'wall', src: '/sprites/Big-Round-Table.png' },
  { id: 'center_plant1', x: 620, y: 320, width: 40, height: 80, type: 'wall', src: '/sprites/Small-Plant.png' },
  { id: 'center_plant2', x: 805, y: 400, width: 40, height: 80, type: 'wall', src: '/sprites/Small-Plant.png' },

  // dept1 ke liye
  { id: 'desk_tl1', x: 100, y: 150, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'desk_tl2', x: 250, y: 150, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'plant_tl', x: 40, y: 150, width: 50, height: 100, type: 'wall', src: '/sprites/Big-Plant.png' },
  { id: 'plant_tl_small', x: 385, y: 150, width: 40, height: 80, type: 'wall', src: '/sprites/Small-Plant.png' },

  // dept2 ke liye
  { id: 'desk_tr1', x: 1100, y: 150, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'desk_tr2', x: 1250, y: 150, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'shelf_tr', x: 1385, y: 125, width: 75, height: 125, type: 'wall', src: '/sprites/Bookshelf.png' },
  { id: 'plant_tr', x: 1040, y: 150, width: 50, height: 100, type: 'wall', src: '/sprites/Big-Plant.png' },

  // dept3 ke liye
  { id: 'desk_bl1', x: 100, y: 550, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'desk_bl2', x: 250, y: 550, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'bin_bl', x: 385, y: 575, width: 50, height: 50, type: 'wall', src: '/sprites/Bin.png' },
  { id: 'plant_bl', x: 40, y: 550, width: 50, height: 100, type: 'wall', src: '/sprites/Big-Plant.png' },

  // dept4 ke liye
  { id: 'desk_br1', x: 1100, y: 550, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'desk_br2', x: 1250, y: 550, width: 125, height: 75, type: 'table', src: '/sprites/Desk.png' },
  { id: 'plant_br', x: 1385, y: 550, width: 50, height: 100, type: 'wall', src: '/sprites/Big-Plant.png' },
  { id: 'plant_br_small', x: 1040, y: 550, width: 40, height: 80, type: 'wall', src: '/sprites/Small-Plant.png' },

  // coffee/water station
  { id: 'coffee_1', x: 685, y: 50, width: 50, height: 75, type: 'wall', src: '/sprites/Coffee-Machine.png' },
  { id: 'water_1', x: 745, y: 50, width: 50, height: 100, type: 'wall', src: '/sprites/Water-Dispenser.png' },
  { id: 'plant_coffee', x: 810, y: 50, width: 50, height: 100, type: 'wall', src: '/sprites/Big-Plant.png' },

  // waiting/lounge
  { id: 'sofa_wait', x: 660, y: 650, width: 150, height: 75, type: 'wall', src: '/sprites/Big-Sofa.png' },
  { id: 'papers_wait', x: 715, y: 730, width: 40, height: 40, type: 'rug', src: '/sprites/Papers.png' },
  { id: 'plant_lounge', x: 820, y: 650, width: 40, height: 80, type: 'wall', src: '/sprites/Small-Plant.png' }
];

type PlayerPosition = { x: number, y: number, username?: string, avatarId?: string, direction?: string, isMoving: boolean };

export default function Home() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [hasJoined, setHasJoined] = useState<boolean>(false);


  // doosre players ko set karne ke liye
  const [otherPlayers, setOtherPlayers] = useState<Record<string, PlayerPosition>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // use a ref to hold the socket instance so it persists across renders
  const socketRef = useRef<Socket | null>(null);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState<boolean>(false);

  // const[selectedColor , setSelectedColor] = useState<string>("#3b82f6");

  const [selectedAvatar, setSelectedAvatar] = useState("avatar_1");


  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{ id: string, name: string } | null>(null);
  const [outboundRequest, setOutboundRequest] = useState<string | null>(null);    //ye "waiting to answer " show karne ke liye hai


  useEffect(() => {
    // connect inside the component lifecycle
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");
    socketRef.current.on("connect", () => setIsConnected(true));
    socketRef.current.on("disconnect", () => setIsConnected(false));

    //listen the master list of players from the server
    socketRef.current.on("stateUpdate", (players: Record<string, PlayerPosition>) => {
      const playersCopy = { ...players };
      // remove ourselves from this copy
      if (socketRef.current?.id) {
        delete playersCopy[socketRef.current.id];
      }
      setOtherPlayers(playersCopy);
    });

    //listen for new chat
    socketRef.current.on("newChat", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    })

    //listen for someone asking to talk to us
    socketRef.current.on("incomingRequest", (data: { id: string, name: string }) => {
      setIncomingRequest(data);
    });



    // CRITICAL: Clean up the connection when Next.js reloads the component
    // ye hot fast refresh se connection band karne ke liye
    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("newChat");
    };
  }, []);



  // keyboard logic
  const { position, direction, isMoving } = useBoard({
    BOARD_WIDTH,
    BOARD_HEIGHT,
    STEP_SIZE,
    DOT_SIZE,
    hasJoined,
    mapObjects: MAP_OBJECTS,
    onMove: (newPos) => {
      socketRef.current?.emit("move", newPos);
    }
  });



  useEffect(() => {
    if (!hasJoined) return;

    let closestPlayerId: string | null = null;
    let minDistance = PROXIMITY_THRESHOLD;

    //scan all the players
    Object.entries(otherPlayers).forEach(([id, player]) => {
      const myPoint = { x: position.x, y: position.y };
      const theirPoint = { x: player.x, y: player.y };
      const dist = calculateDistance(myPoint, theirPoint);
      if (dist < minDistance) {
        minDistance = dist;
        closestPlayerId = id
      }
    });
    setNearbyPlayerId(closestPlayerId)
  }, [position, otherPlayers, hasJoined])

  //all the RTC logic (reduced)
  const { initialiseMedia, initiateCall } = useWebRTC({
    socketRef,
    isConnected,
    hasJoined,
    position,
    otherPlayers
  });



  //listen for accepted requests 
  useEffect(() => {
    if (!socketRef.current) return;

    const handleAccept = (data: { id: string }) => {
      setOutboundRequest(null);
      initiateCall(data.id); // this will now correctly have access to localStream
    };

    socketRef.current.on("requestAccepted", handleAccept);

    return () => {
      socketRef.current?.off("requestAccepted", handleAccept);
    }
  }, [initiateCall, socketRef]); // re run the effect safely when localStream is acquired

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900 text-white font-sans">

      {/* 1. LOBBY SCREEN OVERLAY */}
      {!hasJoined ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-sans">

          {/* Animated Background Layers */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          {/* Glowing Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10 mb-10 text-center flex flex-col items-center">

            {/* Startup Logo Style */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white w-8 h-8">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-400 tracking-tight drop-shadow-sm">
                sdcHouse
              </h1>
            </div>

            <p className="text-slate-400 text-lg max-w-sm font-medium">
              Your spatial collaboration space for the Software Development Club.
            </p>
          </div>

          <div className="relative z-10">
            <Lobby
              username={username}
              setUsername={setUsername}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              onJoin={() => {
                if (username.trim()) {
                  socketRef.current?.emit("join", { username: username, avatarId: selectedAvatar });
                  setHasJoined(true);
                  // ask for mic permission right after joining
                  initialiseMedia();
                }
              }}
            />
          </div>
        </div>
      ) : (

        /* 2. THE METAVERSE (MAIN UI) */
        <>
          {/* Base Layer: The Game Board fills the screen */}
          <div className="absolute inset-0 z-0 overflow-auto bg-[#0f172a]">
            <GameBoard
              position={position}
              direction={direction}
              isMoving={isMoving}
              otherPlayers={otherPlayers}
              username={username}
              boardHeight={BOARD_HEIGHT}
              boardWidth={BOARD_WIDTH}
              avatarId={selectedAvatar}
              mapObjects={MAP_OBJECTS}
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

          {/* HUD Overlay: Player List (Left Sidebar) */}
          {isPlayerListOpen && (
            <div className="absolute top-24 left-4 z-40 animate-in slide-in-from-left-5 fade-in duration-200">
              <PlayerList
                localUsername={username}
                otherPlayers={otherPlayers}
              />
            </div>
          )}

          {/* HUD Overlay: Interaction Prompts (Bottom Center) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-4 items-center pointer-events-none">

            {/* 1. "Ask to Talk" Prompt */}
            {nearbyPlayerId && !outboundRequest && !incomingRequest && (
              <div className="bg-slate-800/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-600 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 pointer-events-auto">
                <span className="text-sm font-medium text-gray-200">
                  <span className="text-blue-400 font-bold">{otherPlayers[nearbyPlayerId]?.username}</span> is nearby
                </span>
                <button
                  onClick={() => {
                    setOutboundRequest(nearbyPlayerId);
                    socketRef.current?.emit("askToTalk", { targetId: nearbyPlayerId, senderName: username });
                  }}
                  className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Ask to Talk
                </button>
              </div>
            )}

            {/* 2. "Waiting for response..." State */}
            {outboundRequest && (
              <div className="bg-slate-800/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-600 shadow-2xl flex items-center gap-3 animate-in fade-in pointer-events-auto">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-300">
                  Waiting for {otherPlayers[outboundRequest]?.username} to accept...
                </span>
                <button
                  onClick={() => setOutboundRequest(null)}
                  className="ml-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* 3. "Incoming Request" Toast */}
            {incomingRequest && (
              <div className="bg-indigo-600/95 backdrop-blur-md p-4 rounded-2xl border border-indigo-500 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 pointer-events-auto w-72">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    📞
                  </div>
                  <div>
                    <p className="text-white font-bold">{incomingRequest.name}</p>
                    <p className="text-indigo-200 text-xs">wants to join your conversation</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      // We will wire up the actual WebRTC accept logic here later
                      socketRef.current?.emit("acceptTalk", { targetId: incomingRequest.id });
                      setIncomingRequest(null);
                    }}
                    className="flex-1 bg-white text-indigo-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setIncomingRequest(null)}
                    className="flex-1 bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-800 transition-colors border border-indigo-500"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

          </div>



          {/* HUD Overlay: Bottom Right (Action Buttons) */}
          <div className="absolute bottom-6 right-6 z-40 flex gap-3">
            {/* Player List Toggle Button */}
            <button
              onClick={() => setIsPlayerListOpen(!isPlayerListOpen)}
              className={`p-4 rounded-full shadow-xl transition-all flex items-center justify-center ${isPlayerListOpen ? 'bg-slate-700 hover:bg-slate-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              <div className="w-5 h-5 flex flex-col gap-1 justify-center items-center">
                <div className="w-4 h-1 bg-white rounded-full" />
                <div className="w-5 h-1 bg-white rounded-full" />
                <div className="w-4 h-1 bg-white rounded-full" />
              </div>
            </button>

            {/* Chat Toggle Button */}
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
                onSendMessage={(text) => socketRef.current?.emit("sendChat", text)}
                localSocketId={socketRef.current?.id}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}