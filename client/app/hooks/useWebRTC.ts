import { useState , useEffect , useRef , MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import { calculateDistance } from "../utils/distance";


export type PlayerPosition = {x : number ; y : number ; username?: string};

const PROXIMITY_THRESHOLD =35;

interface UseWebRTCProps {
    socketRef : MutableRefObject<Socket | null>;
    isConnected : boolean,
    hasJoined : boolean,
    position : {x : number; y : number},
    otherPlayers : Record<string , PlayerPosition>;
}

export const UseWebRTC = ({
    socketRef , 
    isConnected , 
    hasJoined , 
    position ,
    otherPlayers , 
} : UseWebRTCProps) => {
    const [localStream , setLocalStream] = useState<MediaStream | null>(null)
    const peersRef = useRef<Map<string , RTCPeerConnection>>(new Map());

    const initialiseMedia = async () => {
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
    };


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
  }, [localStream , isConnected , socketRef]); // This hook ONLY runs after localStream is set!



  // 2. Proximity Radar & Outgoing Calls
  useEffect(() => {
    if (!hasJoined || !localStream || !isConnected || !socketRef.current) return;

    const createPeerConnection = async (targetId: string) => {
      if (peersRef.current.has(targetId)) return;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peersRef.current.set(targetId, pc);

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit("webrtc-ice-candidate", { targetId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch((e) => console.error("Audio play failed:", e));
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("webrtc-offer", { targetId, offer });
    };

    Object.entries(otherPlayers).forEach(([id, player]) => {
      const dist = calculateDistance(position, player);

      if (dist < PROXIMITY_THRESHOLD) {
        if (socketRef.current?.id && socketRef.current.id > id) {
          createPeerConnection(id);
        }
      } else {
        if (peersRef.current.has(id)) {
          peersRef.current.get(id)?.close();
          peersRef.current.delete(id);
        }
      }
    });
  }, [position, otherPlayers, hasJoined, localStream, isConnected, socketRef]);

  return { initialiseMedia };

    
}