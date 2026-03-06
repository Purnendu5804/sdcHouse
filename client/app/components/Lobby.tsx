import React from "react";

type LobbyProps = {
    username : string;
    setUsername : (name : string) => void;
    onJoin : () => void;
};


export default function Lobby({username , setUsername , onJoin} : LobbyProps) {
    return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-800 rounded-lg border-2 border-blue-400">
      <h2 className="text-2xl font-bold text-blue-400">Join Room</h2>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400"
      />
      <button
        onClick={onJoin}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 font-bold rounded transition text-white"
      >
        Join Room
      </button>
    </div>
  );
}