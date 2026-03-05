import React from "react";

type PlayerProps = {
    x : number;
    y : number;
    color : string;
}

const DOT_SIZE = 25;

export default function Player({x , y , color} : PlayerProps) {
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
    />
  );
}