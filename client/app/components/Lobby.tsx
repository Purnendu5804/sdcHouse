import React from "react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

type LobbyProps = {
    username : string;
    setUsername : (name : string) => void;
    selectedColor : string;
    setSelectedColor : (color : string) => void;
    onJoin : () => void;
};


export default function Lobby({ username, setUsername, selectedColor, setSelectedColor, onJoin }: LobbyProps) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-96">
      <input 
        type="text" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Username"
        className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 mb-6 focus:ring-2 focus:ring-blue-500 outline-none text-white"
        onKeyDown={(e) => e.key === 'Enter' && onJoin()}
      />

      <p className="text-sm text-gray-400 mb-3 text-center">Pick your avatar color:</p>
      <div className="flex justify-between mb-8 px-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${selectedColor === color ? 'ring-4 ring-white scale-125' : 'ring-2 ring-transparent'}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <button 
        onClick={onJoin}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors text-white shadow-lg"
      >
        Join Space
      </button>
    </div>
  );
}