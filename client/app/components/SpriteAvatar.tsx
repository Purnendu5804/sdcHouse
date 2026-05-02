import React, { useEffect, useState } from 'react';

interface SpriteAvatarProps {
  avatarUrl: string;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  username: string;
}

export default function SpriteAvatar({ avatarUrl, direction, isMoving, username }: SpriteAvatarProps) {
  const [frame, setFrame] = useState(0);
  

  const totalFrames = 4; 

  const spriteSize = 32; 


  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMoving) {
      interval = setInterval(() => {
        setFrame((prev) => (prev + 1) % totalFrames);
      }, 150); 
    } else {
      setFrame(0); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMoving]);

  
  const directionToRow = {
    down: 0,   
    left: 1,   
    right: 2,  
    up: 3,     
  };

  // calculating the exact pixel to shift the "Camera Lens"
  const xOffset = -(frame * spriteSize);
  const yOffset = -(directionToRow[direction] * spriteSize);

  return (
    <div className="relative flex flex-col items-center justify-center pointer-events-none">

      <div className="absolute -top-6 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-10 border border-white/10">
        {username}
      </div>

      {/* The Sprite Camera Lens */}
      <div 
        style={{
          width: `${spriteSize}px`,
          height: `${spriteSize}px`,
          backgroundImage: `url('${avatarUrl}')`,
          backgroundPosition: `${xOffset}px ${yOffset}px`,
          backgroundSize: `${spriteSize * 4}px ${spriteSize * 4}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated', 
          transform: 'scale(1.5)', // Scales the 32px character up to 48px so it's easier to see
        }}
      />
    </div>
  );
}