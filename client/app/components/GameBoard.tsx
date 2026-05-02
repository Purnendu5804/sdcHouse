import Player from "./Player";
import SpriteAvatar from "./SpriteAvatar";


export interface MapObject {
  id : string;
  type : 'table' | 'plant' | 'rug';
  x : number;
  y : number;
  width : number;
  height : number;
}

interface GameBoardProps {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  otherPlayers: Record<string, any>;
  username: string;
  boardWidth : number;
  boardHeight : number;
  color : string;
  mapObjects?: MapObject[];
}

export default function GameBoard({ position, direction,isMoving, otherPlayers, username, boardHeight , boardWidth, color , mapObjects = [] }: GameBoardProps) {
  return (
    <div 
      className="relative overflow-hidden border-2 border-slate-700 rounded-xl shadow-2xl"
      style={{ 
        width: `${boardWidth}px`, 
        height: `${boardHeight}px`,
        backgroundColor: '#0f172a', 
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '25px 25px' 
      }}
    >

      {/* 3. Render Environment Objects BEFORE players so they stay on the floor */}
      {mapObjects.map((obj) => (
        <div
          key={obj.id}
          className="absolute flex items-center justify-center text-[10px] font-bold shadow-lg uppercase tracking-wider"
          style={{
            left: `${obj.x}px`,
            top: `${obj.y}px`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
            // Styling based on object type
            backgroundColor: obj.type === 'table' ? '#5c4033' : obj.type === 'plant' ? '#166534' : '#1e293b',
            borderColor: obj.type === 'table' ? '#3e2723' : obj.type === 'plant' ? '#064e3b' : 'transparent',
            borderWidth: obj.type === 'rug' ? '0px' : '2px',
            borderRadius: obj.type === 'plant' ? '50%' : '6px',
            zIndex: obj.type === 'rug' ? 0 : 5, // Rugs are flat on the floor, tables are slightly raised
            color: 'rgba(255,255,255,0.4)',
            opacity: obj.type === 'rug' ? 0.3 : 1
          }}
        >
          {obj.type === 'table' && "Table"}
          {obj.type === 'plant' && "🌿"}
        </div>
      ))}

      
      {/* Local Player */}
      <div 
        className="absolute transition-all duration-100 ease-linear z-20"
        style={{ left: position.x, top: position.y }}
      >
        <SpriteAvatar 
          username={username || "Me"}
          avatarUrl="/sprites/avatar_2-removebg-preview.png" 
          direction={direction as 'up' | 'down' | 'left' | 'right'}
          isMoving={isMoving} 
        />
      </div>
      

      {/* Remote Players */}
      {Object.entries(otherPlayers).map(([id, player]) => (
        <div 
          key={id}
          className="absolute transition-all duration-100 ease-linear z-10"
          style={{ left: player.x, top: player.y }}
        >
          <SpriteAvatar 
            username={player.username || "Guest"}
            avatarUrl="/sprites/avatar_2-removebg-preview.png"
            direction={(player.direction as 'up' | 'down' | 'left' | 'right') || 'down'}
            isMoving={player.isMoving || false} 
          />
        </div>
      ))}
    </div>
  );
}