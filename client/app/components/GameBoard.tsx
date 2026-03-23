import React from "react";
import Player from "./Player";

type PlayerPosition = {x : number ; y : number ; username?: string; direction?: string; isMoving?: boolean; };

type GameBoardProps = {
    position : {x : number ; y : number ; direction?: string ; isMoving?: boolean; };
    otherPlayers : Record<string , PlayerPosition>;
    username : string;
    boardSize : number;
}


export default function GameBoard({ position, otherPlayers, username, boardSize }: GameBoardProps) {
  return (
    <>
      <div 
        className="relative border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        style={{ 
            width: boardSize, 
            height: boardSize,
            backgroundImage: "url('https://labs.phaser.io/assets/tilemaps/tiles/drawtiles1.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "32px 32px",
            imageRendering: "pixelated"
        }}
      >
        {/* Render Other Players */}
        {Object.entries(otherPlayers).map(([id, pos]) => (
          <Player 
            key={id} 
            x={pos.x} 
            y={pos.y} 
            color="#ef4444" 
            name={pos.username || "Guest"} 
            direction={pos.direction}
            isMoving={pos.isMoving}
          />
        ))}

        {/* Render Local Player */}
        <Player 
          x={position.x} 
          y={position.y} 
          color="#3b82f6" 
          name={username}
          direction={position.direction}
          isMoving={position.isMoving}
        />
      </div>
      

    </>
  );
}