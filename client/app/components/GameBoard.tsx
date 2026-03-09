import React from "react";
import Player from "./Player";

type PlayerPosition = {x : number ; y : number ; username?: string };

type GameBoardProps = {
    position : {x : number ; y : number};
    otherPlayers : Record<string , PlayerPosition>;
    username : string;
    boardSize : number;
}


export default function GameBoard({ position, otherPlayers, username, boardSize }: GameBoardProps) {
  return (
    <>
      <div 
        className="relative bg-gray-800 border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        style={{ width: boardSize, height: boardSize }}
      >
        {/* Render Other Players */}
        {Object.entries(otherPlayers).map(([id, pos]) => (
          <Player key={id} x={pos.x} y={pos.y} color="#ef4444" name={pos.username || "Guest"} />
        ))}

        {/* Render Local Player */}
        <Player x={position.x} y={position.y} color="#3b82f6" name={username} />
      </div>
      

    </>
  );
}