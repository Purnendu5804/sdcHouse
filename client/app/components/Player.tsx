import React from "react";

type PlayerProps = {
    x : number;
    y : number;
    color : string;
    name : string;
}

const DOT_SIZE = 25;

export default function Player({x , y , color , name} : PlayerProps) {
    return (
    <div
      className={`absolute rounded-full transition-transform duration-100 ease-linear z-10`}
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        backgroundColor: color,
        boxShadow: `0 0 15px ${color}`,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* nama diya hai yaha pe */}
      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap bg-gray-900/50 px-1 rounded">
        {name}
      </span>
    </div>
  );
}