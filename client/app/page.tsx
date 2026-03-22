"use client";

import {io , Socket} from "socket.io-client";
import { useEffect , useRef, useState } from "react";
import Player from "./components/Player";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import ChatBox , {ChatMessage} from "./components/ChatBox";
import { calculateDistance } from "./utils/distance";
import { useBoard } from "./hooks/useBoard";



//constants for out room physics
const BOARD_SIZE = 500;
const DOT_SIZE = 25;
const STEP_SIZE = 25;


const PROXIMITY_THRESHOLD = 35;


type PlayerPosition = {x : number , y : number , username?: string};


export default function Home () {
  const [isConnected , setIsConnected] = useState<boolean>(false);
  const [username , setUsername] = useState<string>("");
  const [hasJoined , setHasJoined] = useState<boolean>(false);



  // doosre players ko set karne ke liye
  const[otherPlayers , setOtherPlayers] = useState<Record<string , PlayerPosition>>({});


  const [messages , setMessages] = useState<ChatMessage[]>([]);

  // use a ref to hold the socket instance so it persists across renders
  const socketRef  = useRef<Socket | null>(null);


  // state to hold audio stream
  const[localStream , setLocalStream] = useState<MediaStream | null > (null);

  //socketId -> RTCPeerConnection
  //track active connection so we don't try to call the same person several times;

  const peersRef = useRef<Map<String , RTCPeerConnection>>(new Map());

useEffect(() => {

  // connect inside the component lifecycle
  socketRef.current = io("http://localhost:3001");
  socketRef.current.on("connect" , () => setIsConnected(true));
  socketRef.current.on("disconnect" , () => setIsConnected(false));

  //listen the master list of players from the server
  socketRef.current.on("stateUpdate" , (players : Record<string , PlayerPosition>) => {
    const playersCopy = {...players};
    // remove ourselves from this copy
    if (socketRef.current?.id) {
      delete playersCopy[socketRef.current.id];
    }
    setOtherPlayers(playersCopy);
  });

  //listen for new chat
  socketRef.current.on("newChat" ,(msg : ChatMessage) => {
    setMessages((prev) => [...prev , msg]);
  })

  // CRITICAL: Clean up the connection when Next.js reloads the component
  // ye hot fast refresh se connection band karne ke liye
    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("newChat");
    };
} , []);


const { position } = useBoard({
  BOARD_SIZE,
  STEP_SIZE,
  DOT_SIZE,
  hasJoined,
  onMove : (newPos) => {
    socketRef.current?.emit("move" , newPos);
  }
})
  

  // to calculate proximity everytime
  useEffect(() => {
    if(!hasJoined || !localStream) return ;

    Object.entries(otherPlayers).forEach(([id , player]) => {
      const dist = calculateDistance(position , player);


      if(dist < PROXIMITY_THRESHOLD) {
        //only initiates if my ID is greater then theirs , simple p2p handshake rule
        if(socketRef.current?.id && socketRef.current.id > id) {
          createPeerConnection(id);
        }
      } else {
        //close connection if we walk away
        if(peersRef.current.has(id)) {
          peersRef.current.get(id)?.close();
          peersRef.current.delete(id);
        }
      }
    })
  }, [position, otherPlayers , hasJoined , localStream]);


  //incoming WebRTC Signaling
  useEffect(() => {
    if (!socketRef.current || !localStream) return;

    //handling an Incoming Call (The Offer)
    const handleReceiveOffer = async ({ senderId, offer }: { senderId: string, offer: RTCSessionDescriptionInit }) => {
      // Create a new connection for this caller
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peersRef.current.set(senderId, pc);

      // Add our mic audio to send back to them
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      // Handle their network paths
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("webrtc-ice-candidate", { targetId: senderId, candidate: event.candidate });
        }
      };

      //play their audio when we receive it
      pc.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play().catch(e => console.error("Audio play failed:", e));
      };

     
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketRef.current?.emit("webrtc-answer", { targetId: senderId, answer });
    };

    
    const handleReceiveAnswer = async ({ senderId, answer }: { senderId: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peersRef.current.get(senderId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    // handling ICE Candidates 
    const handleReceiveIce = async ({ senderId, candidate }: { senderId: string, candidate: RTCIceCandidateInit }) => {
      const pc = peersRef.current.get(senderId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    // Attach the listeners
    socketRef.current.on("webrtc-offer", handleReceiveOffer);
    socketRef.current.on("webrtc-answer", handleReceiveAnswer);
    socketRef.current.on("webrtc-ice-candidate", handleReceiveIce);

    // Cleanup listeners so we don't get duplicates if React re-renders
    return () => {
      socketRef.current?.off("webrtc-offer", handleReceiveOffer);
      socketRef.current?.off("webrtc-answer", handleReceiveAnswer);
      socketRef.current?.off("webrtc-ice-candidate", handleReceiveIce);
    };
  }, [localStream]); // This hook ONLY runs after localStream is set!


  // audio request
  const initialiseMedia = async() => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio : true,
        video : false
      });

      setLocalStream(stream);
      console.log("Microphone access granted !");
    } catch(err) {
      console.error("Error accessing microphone:" , err) ;
      alert("We need microphone access for proximity chat to work!")
    }
  }


  //webRTC call
  const createPeerConnection = async(targetId : string) => {
    if(peersRef.current.has(targetId)) return;

    const pc = new RTCPeerConnection({
      iceServers : [{urls : "stun:stun.l.google.com:19302"}] // stun server
    });

    peersRef.current.set(targetId , pc);

    //add audio tracks to the connection
    localStream?.getTracks().forEach(track => pc.addTrack(track , localStream));

    //handle ICE Candidates
    pc.onicecandidate = (event) => {
      if(event.candidate) {
        socketRef.current?.emit("webrtc-ice-candidate" , {targetId , candidate : event.candidate});
      }
    };

    //handle incoming audio
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      //play this audio
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    };

    //create offer and send
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("webrtc-offer" , {targetId , offer});
  }

 return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-center text-blue-400">sdcHouse</h1>
        <p className="text-center text-sm font-mono bg-gray-800 p-2 rounded">
          Network: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
      </div>

      {!hasJoined ? (
        <Lobby 
          username={username}
          setUsername={setUsername}
          onJoin={() => {
            if (username.trim()) {
              socketRef.current?.emit("join" , username);
              setHasJoined(true);
              // ask for mic permission right after joining
              initialiseMedia();
            }
          }}
        />
      ) : (
        <div className="flex flex-row items-start justify-center">
          <GameBoard 
          position={position}
          otherPlayers={otherPlayers}
          username = {username}
          boardSize={BOARD_SIZE}
        />

        <ChatBox
          messages={messages}
          onSendMessage={(text) => socketRef.current?.emit("sendChat" , text)}
          localSocketId={socketRef.current?.id}
        />
        </div>
        
      
      )}
    </div>
  );
}