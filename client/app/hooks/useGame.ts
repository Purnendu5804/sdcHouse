import { useState , useEffect , MutableRefObject } from "react";
import { Socket } from "socket.io-client";

export type PlayerPosition = {x : number , y : number , username?: string};

export const useGame = (
    socketRef : MutableRefObject<Socket | null>,
    isConnected : boolean ,
    hasJoined : boolean,
    BOARD_SIZE : number,
    STEP_SIZE : number,
    DOT_SIZE : number
) => {
    //humara local dot kaha pe hai
    const [position , setPosition] = useState({x : 0 , y : 0});
    // doosre players ko set karne ke liye
    const [otherPlayers , setOtherPlayers] = useState<Record<string , PlayerPosition>>({});

    // handle keyboard movement
      useEffect(()=> {

        if(!hasJoined) return;

        const handleKeyDown = (e : KeyboardEvent) => {
          //prevent browser from scrolling when using arrow keys
          if(["ArrowUp" , "ArrowDown" , "ArrowLeft" , "ArrowRight"].includes(e.key)) {
            e.preventDefault();
          }
    
          setPosition((prev) => {
            let newX = prev.x;
            let newY = prev.y;
            
    
            if(e.key == "ArrowUp") newY = Math.max(0 , prev.y - STEP_SIZE);
            if(e.key == "ArrowDown") newY = Math.min(BOARD_SIZE - DOT_SIZE , prev.y + STEP_SIZE);
            if(e.key == "ArrowLeft") newX = Math.max(0 , prev.x - STEP_SIZE);
            if(e.key == "ArrowRight") newX = Math.min(BOARD_SIZE - DOT_SIZE , prev.x + STEP_SIZE);
    
    
            //tell server that we moved !
            if(socketRef.current && (newX !== prev.x || newY !== prev.y)) {
              socketRef.current.emit("move" , {x : newX , y : newY})
            }
    
            return {x : newX , y : newY};
          });
        };
    
        window.addEventListener("keydown" , handleKeyDown);
        return () => window.removeEventListener("keydown" , handleKeyDown);
      } , [hasJoined , BOARD_SIZE , STEP_SIZE , DOT_SIZE , socketRef]);


      useEffect(() => {
        if(!socketRef.current || !isConnected) return;

        const handleStateUpdate = (players : Record<string  , PlayerPosition>) => {
            const playersCopy = {...players};
            // remove ourselves from this copy
            if (socketRef.current?.id) {
            delete playersCopy[socketRef.current.id];
            }
            setOtherPlayers(playersCopy);
        };

        socketRef.current.on("stateUpdate" , handleStateUpdate);

        return () => {
            socketRef.current?.off("stateUpdate" , handleStateUpdate);
        }
      } , [socketRef , isConnected]);



      return { position , otherPlayers};


      
}