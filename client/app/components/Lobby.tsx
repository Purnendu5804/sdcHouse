import React, { useState } from "react";
import { ArrowRight, User, Sparkles } from "lucide-react";

const COLORS = [
  { hex: "#3b82f6", name: "Neon Blue" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#f43f5e", name: "Rose" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#0ea5e9", name: "Sky" }
];

type LobbyProps = {
    username : string;
    setUsername : (name : string) => void;
    selectedColor : string;
    setSelectedColor : (color : string) => void;
    onJoin : () => void;
};

export default function Lobby({ username, setUsername, selectedColor, setSelectedColor, onJoin }: LobbyProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-[420px] p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Subtle top glow within the card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="space-y-8">
        {/* Username Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User size={15} className="text-blue-400" />
            Display Name
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="How should we call you?"
              className="relative w-full p-4 rounded-xl bg-slate-950/80 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none text-white placeholder-slate-600 transition-all font-medium text-lg"
              onKeyDown={(e) => e.key === 'Enter' && onJoin()}
            />
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={15} className="text-purple-400" />
            Avatar Color
          </label>
          <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            {COLORS.map((colorObj) => {
              const isActive = selectedColor === colorObj.hex;
              return (
                <button
                  key={colorObj.hex}
                  onClick={() => setSelectedColor(colorObj.hex)}
                  className="relative group p-1 flex items-center justify-center transition-transform hover:scale-110 outline-none"
                  title={colorObj.name}
                  type="button"
                >
                  {/* Glowing Backdrop */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-full blur-md opacity-70 scale-150"
                      style={{ backgroundColor: colorObj.hex }}
                    />
                  )}
                  {/* Color Circle */}
                  <div 
                    className={`relative w-8 h-8 rounded-full transition-all duration-300 border-2 shadow-lg ${isActive ? 'scale-110 border-white' : 'border-transparent group-hover:border-white/50'}`}
                    style={{ backgroundColor: colorObj.hex }}
                  />
                  {/* Inner Dot indicating Active */}
                  {isActive && (
                    <div className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-sm z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Join Button */}
        <div className="pt-2">
          <button 
            onClick={onJoin}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={!username.trim()}
            className={`relative w-full group overflow-hidden rounded-xl font-bold text-lg transition-all duration-300 ${username.trim() ? 'scale-100 opacity-100' : 'opacity-50 cursor-not-allowed grayscale'}`}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:scale-105 transition-transform duration-500"></div>
            
            {/* Inner glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white mix-blend-overlay transition-opacity duration-300"></div>
            
            <div className="relative py-4 px-6 flex items-center justify-center gap-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <span>Enter Workspace</span>
              <ArrowRight 
                size={22} 
                className={`transition-transform duration-300 ${isHovered && username.trim() ? 'translate-x-1.5' : ''}`} 
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}