interface PlayerProps {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isLocal: boolean;
  username: string;
}

export default function Player({ position, direction, isLocal, username }: PlayerProps) {
  const size = 25; 
  // calculate rotation for the vision indicator based on direction
  const getRotation = () => {
    switch(direction) {
      case 'up': return 'rotate(-90deg)';
      case 'down': return 'rotate(90deg)';
      case 'left': return 'rotate(180deg)';
      case 'right': return 'rotate(0deg)';
      default: return 'rotate(90deg)';
    }
  };

  return (
    <div 
      className={`absolute rounded-full flex items-center justify-center transition-all duration-100 shadow-md ${isLocal ? 'bg-blue-500 z-20' : 'bg-red-500 z-10'}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* The Vision Indicator */}
      <div 
        className="absolute w-full h-full transition-transform duration-150"
        style={{ transform: getRotation() }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm translate-x-[2px]" />
      </div>

      {/* Username label */}
      <div className="absolute -top-6 bg-gray-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
        {username}
      </div>
    </div>
  );
}