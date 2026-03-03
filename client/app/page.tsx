"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useEffectEvent, useState } from "react";

const socket:Socket = io("http://localhost:3001");

//constants for out room physics
const BOARD_SIZE = 500;
const DOT_SIZE = 25;
const STEP_SIZE = 25;


export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);

  //track where our local dot is
  const[position , setPosition] = useState({x : 0 , y : 0});

  useEffect(() => {
    socket.on("connect" , () => {
      setIsConnected(true);
      console.log("Connected to sdcHouse server !");
    });

    socket.on("disconnect" , () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
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

        return {x : newX , y : newY};
      });
    };

    window.addEventListener("keydown" , handleKeyDown);
    return () => window.removeEventListener("keydown" , handleKeyDown);
  } , []);

 return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-center text-blue-400">sdcHouse</h1>
        <p className="text-center text-sm font-mono bg-gray-800 p-2 rounded">
          Network: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
      </div>

      {/* The Room Container */}
      <div 
        className="relative bg-gray-800 border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {/* The Player Dot */}
        <div
          className="absolute bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-transform duration-100 ease-linear"
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>
      
      <p className="mt-6 text-gray-400 font-mono">Use Arrow Keys to move around</p>
    </div>
  );


}