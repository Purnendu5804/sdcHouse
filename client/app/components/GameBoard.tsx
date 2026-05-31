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
      {/* LAYER 1: ZONE FLOORS */}
      {/* dept1 */}
      <div className="absolute" style={{ left: 30, top: 120, width: 440, height: 220, zIndex: 1, backgroundImage: "url('/sprites/zone_desk_wood.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* dept2 */}
      <div className="absolute" style={{ left: 1020, top: 120, width: 510, height: 220, zIndex: 1, backgroundImage: "url('/sprites/zone_desk_wood.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* dept3 */}
      <div className="absolute" style={{ left: 30, top: 510, width: 440, height: 220, zIndex: 1, backgroundImage: "url('/sprites/zone_desk_wood.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* dept4 */}
      <div className="absolute" style={{ left: 1020, top: 510, width: 510, height: 220, zIndex: 1, backgroundImage: "url('/sprites/zone_desk_wood.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* meeting */}
      <div className="absolute" style={{ left: 610, top: 300, width: 210, height: 210, zIndex: 1, backgroundImage: "url('/sprites/zone_meeting_blue.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* lounge */}
      <div className="absolute" style={{ left: 610, top: 610, width: 260, height: 160, zIndex: 1, backgroundImage: "url('/sprites/zone_lounge_gold.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* coffee */}
      <div className="absolute" style={{ left: 640, top: 25, width: 220, height: 140, zIndex: 1, backgroundImage: "url('/sprites/zone_hall_gray.png')", backgroundRepeat: 'repeat', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />

      {/* LAYER 2: WALLS */}
      {/* Top wall */}
      <div className="absolute" style={{ left: 0, right: 0, top: 0, height: 32, zIndex: 10, backgroundImage: "url('/sprites/wall_tan_brick.png')", backgroundRepeat: 'repeat-x', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* Bottom wall */}
      <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: 32, zIndex: 10, backgroundImage: "url('/sprites/wall_tan_brick.png')", backgroundRepeat: 'repeat-x', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* Left wall */}
      <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 32, zIndex: 10, backgroundImage: "url('/sprites/wall_stone_gray.png')", backgroundRepeat: 'repeat-y', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />
      {/* Right wall */}
      <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: 32, zIndex: 10, backgroundImage: "url('/sprites/wall_stone_gray.png')", backgroundRepeat: 'repeat-y', backgroundSize: '32px 32px', imageRendering: 'pixelated' as const }} />

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