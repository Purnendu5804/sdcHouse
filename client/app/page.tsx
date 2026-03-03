"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useEffectEvent, useState } from "react";

const socket:Socket = io("http://localhost:3001");

export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">sdcHouse MVP</h1>
      <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
    </div>
  );


}