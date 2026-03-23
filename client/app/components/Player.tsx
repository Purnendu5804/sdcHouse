import React from "react";

type PlayerProps = {
    x : number;
    y : number;
    color : string;
    name : string;
    direction?: string;
    isMoving?: boolean;
}

const SPRITE_SIZE = 32;

export default function Player({x , y , color , name, direction = "down", isMoving = false} : PlayerProps) {
    // 4x4 Sprite Sheet Logic: Row 1 (Down), Row 2 (Left), Row 3 (Right), Row 4 (Up)
    let backgroundPositionY = "0px";
    if (direction === "left") backgroundPositionY = "-32px";
    if (direction === "right") backgroundPositionY = "-64px";
    if (direction === "up") backgroundPositionY = "-96px";

    return (
    <div
      className={`absolute transition-transform duration-100 ease-linear z-10 filter drop-shadow-md`}
      style={{
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Dynamic Sprite Rendering */}
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: "url('https://labs.phaser.io/assets/sprites/spaceman.png')",
          backgroundRepeat: "no-repeat",
          backgroundPositionY,
          backgroundSize: "128px 128px", // 4 cols x 32px, 4 rows x 32px
          imageRendering: "pixelated",
          animation: isMoving ? "walk 0.5s steps(4) infinite" : "none",
        }}
      ></div>

      {/* Global CSS for the sprite animation */}
      <style>{`
        @keyframes walk {
          from { background-position-x: 0px; }
          to { background-position-x: -128px; }
        }
      `}</style>

      {/* nama diya hai yaha pe */}
      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap bg-gray-900/50 px-1 rounded">
        {name}
      </span>
    </div>
  );
}