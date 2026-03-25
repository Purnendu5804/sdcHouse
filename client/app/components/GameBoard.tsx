import Player from "./Player";

interface GameBoardProps {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  otherPlayers: Record<string, any>;
  username: string;
  boardWidth : number;
  boardHeight : number;
  color : string;
}

export default function GameBoard({ position, direction, otherPlayers, username, boardHeight , boardWidth, color }: GameBoardProps) {
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
      {/* Local Player */}
      <Player position={position} direction={direction} isLocal={true} username={username} color={color} />

      {/* Remote Players */}
      {Object.entries(otherPlayers).map(([id, player]) => (
        <Player 
          key={id} 
          position={{ x: player.x, y: player.y }} 
          direction={player.direction || 'down'} 
          isLocal={false} 
          username={player.username || "Unknown"} 
          color={player.color}
        />
      ))}
    </div>
  );
}