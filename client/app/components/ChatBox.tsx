import React , {useState} from "react";

export type ChatMessage = {
    id : string;
    name : string;
    text : string;
    time : string;
};

type ChatBoxProps = {
    messages : ChatMessage[];
    onSendMessage : (text : string) => void;
    localSocketId : string | undefined;
}

export default function ChatBox ({messages , onSendMessage , localSocketId} : ChatBoxProps) {

    const[input , setInput] = useState("");

    const handleSend = (e : React.FormEvent) => {
        e.preventDefault();
        if(input.trim()) {
            onSendMessage(input);
            setInput("") // clearing the input after sending
        }
    };
    return (
    <div className="w-80 h-[500px] bg-gray-800 border-4 border-gray-700 rounded-lg flex flex-col shadow-xl ml-6">
      <div className="bg-gray-700 p-3 border-b border-gray-600 font-bold text-blue-400">
        Room Chat
      </div>
      
      {/* Message History Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, index) => {
          const isMe = msg.id === localSocketId;
          return (
            <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <span className="text-xs text-gray-400 mb-1">
                {msg.name} • {msg.time}
              </span>
              <div className={`px-3 py-2 rounded-lg max-w-[90%] text-sm ${isMe ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-100"}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold transition">
          Send
        </button>
      </form>
    </div>
  );
}
