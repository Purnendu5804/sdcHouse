import React, { useState } from "react";
import { ArrowRight, User, Sparkles } from "lucide-react";

const AVATARS = [
  {id : "avatar_1" , name : 'avatar1' , src : '/sprites/avatar_1.png'},
  {id : "avatar_2" , name : 'avatar2' , src : '/sprites/avatar_2.png'},
  {id : "avatar_3" , name : 'avatar3' , src : '/sprites/avatar_3.png'},
  {id : "avatar_4" , name : 'avatar4' , src : '/sprites/avatar_4.png'},
]

type LobbyProps = {
    username : string;
    setUsername : (name : string) => void;
    selectedAvatar : string;
    setSelectedAvatar : (id : string) => void;
    onJoin : () => void;
};

export default function Lobby({ username, setUsername, selectedAvatar, setSelectedAvatar, onJoin }: LobbyProps) {
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

        {/* Avatar Picker */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={15} className="text-purple-400" />
            Choose Avatar
          </label>
          <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5 shadow-inner">
            {AVATARS.map((avatar) => {
              const isActive = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative group flex items-center justify-center transition-all duration-300 w-12 h-12 rounded-full overflow-hidden border-2 outline-none ${
                    isActive 
                      ? 'scale-110 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105 hover:border-white/30'
                  }`}
                  title={avatar.name}
                  type="button"
                >
                  {/* Glowing Backdrop for Active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                  
                  {/* The Cropped Sprite "Lens" */}
                  <div 
                    className="relative z-10"
                    style={{
                      backgroundImage: `url(${avatar.src})`,
                      width: '32px',
                      height: '32px',
                      backgroundPosition: '0px 0px', // Forces it to show the first Down-facing frame
                      backgroundSize: '128px 128px', // Scales your 4x4 grid down perfectly
                      imageRendering: 'pixelated'
                    }}
                  />
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