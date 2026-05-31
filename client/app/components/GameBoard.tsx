import Player from "./Player";
import SpriteAvatar from "./SpriteAvatar";


export interface MapObject {
  id: string;
  type: 'table' | 'plant' | 'rug' | 'wall';
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string;
}

interface GameBoardProps {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  otherPlayers: Record<string, any>;
  username: string;
  boardWidth: number;
  boardHeight: number;
  avatarId: string;
  mapObjects?: MapObject[];
}

export default function GameBoard({ position, direction, isMoving, otherPlayers, username, boardHeight, boardWidth, avatarId, mapObjects = [] }: GameBoardProps) {
  return (
    <div
      className="relative overflow-hidden border-2 border-slate-700 rounded-xl shadow-2xl"
      style={{
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
        backgroundColor: '#c8a96e',
        backgroundImage: "url('/sprites/floor_white_tile.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "32px 32px",
        imageRendering: "pixelated" as const,
      }}
    >

      {/* 3. Render Environment Objects BEFORE players so they stay on the floor */}
      {mapObjects.map((obj) => (
        <div
          key={obj.id}
          className="absolute"
          style={{
            left: `${obj.x}px`,
            top: `${obj.y}px`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
            zIndex: obj.type === 'rug' ? 0 : 5, // Rugs are flat on the floor, tables are slightly raised
            ...(obj.src ? {
              backgroundImage: `url(${obj.src})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
            } : {})
          }}
        />
      ))}


      {/* Local Player */}
      <div
        className="absolute transition-all duration-100 ease-linear z-20"
        style={{ left: position.x, top: position.y }}
      >
        <SpriteAvatar
          username={username || "Me"}
          avatarUrl={`/sprites/${avatarId}.png`}
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
            avatarUrl={`/sprites/${player.avatarId || 'avatar_1'}.png`}
            direction={(player.direction as 'up' | 'down' | 'left' | 'right') || 'down'}
            isMoving={player.isMoving || false}
          />
        </div>
      ))}
    </div>
  );
}