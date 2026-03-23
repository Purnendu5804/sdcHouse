interface PlayerListProps {
    localUsername : string;
    otherPlayers : Record<string , {username?: string}>;
}


export default function PlayerList({localUsername , otherPlayers} : PlayerListProps) {
    //combining local and other players in one list
    const allPlayers = [
        {id : 'local' , username : `${localUsername} (You)` , isLocal : true},
        ...Object.entries(otherPlayers).map(([id , player]) => ({
            id , 
            username : player.username || "Anonymous",
            isLocal : false
        }))
    ];

    return (
    <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl w-64 flex flex-col max-h-[60vh]">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="font-bold text-blue-400">Participants</h2>
        <span className="bg-slate-700 text-[10px] px-2 py-0.5 rounded-full text-gray-300">
          {allPlayers.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {allPlayers.map((player) => (
          <div 
            key={player.id} 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              player.isLocal ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-700/50'
            }`}
          >
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${player.isLocal ? 'bg-blue-400' : 'bg-green-500'}`} />
            
            <span className={`text-sm truncate ${player.isLocal ? 'text-blue-100 font-semibold' : 'text-gray-300'}`}>
              {player.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
