import { useState , useEffect , useRef , MutableRefObject} from "react";
import { Socket } from "socket.io-client";
import { calculateDistance } from "../utils/distance";
import { PlayerPosition } from "./useGame";

const PROXIMITY_THRESHOLD = 35;

export const useWebRTC = (
    socketRef : MutableRefObject<Socket | null>,
    isConnected : boolean,
    hasJoined : boolean , 
    position : PlayerPosition,
    otherPlayers : Record<string , PlayerPosition>
) => {
    // state to hold audio stream
    const[localStream , setLocalStream] = useState<MediaStream | null > (null);
    //track active connection so we don't try to call the same person several times;
    const peersRef = useRef<Map<string , RTCPeerConnection>>(new Map());

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

  //incoming WebRTC Signal
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
    }, [localStream , isConnected]); // This hook ONLY runs after localStream is set!
  

    // to calculate proximity everytime
    useEffect(() => {
        if(!hasJoined || !localStream) return ;

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
    }, [position, otherPlayers , hasJoined , localStream , socketRef, isConnected]);


    return {
        initialiseMedia,
}

}
