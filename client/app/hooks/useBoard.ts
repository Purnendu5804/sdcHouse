import { useState , useEffect } from "react";

interface UseBoardProps {
    BOARD_SIZE : number,
    STEP_SIZE : number,
    DOT_SIZE : number,
    onMove : (newPos : {x : number ; y : number}) => void;
    hasJoined : boolean
}

export const useBoard = ({BOARD_SIZE ,STEP_SIZE , DOT_SIZE , onMove , hasJoined} : UseBoardProps) => {
    // local dot set karne ke liye
    const [position , setPosition] = useState({x : 0 , y : 0});

    useEffect(() => {
        const handleKeyDown = (e : KeyboardEvent) => {
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
            

            const newPos = {x : newX , y : newY};

            //triggering the callback for the socket to tell everyone that moved
            if(newX !== prev.x || newY !== prev.y) {
                onMove(newPos);
            }

            return newPos;
        });
    };

    window.addEventListener("keydown" , handleKeyDown);
    return () => window.removeEventListener("keydown" , handleKeyDown);
    } , [hasJoined , BOARD_SIZE , STEP_SIZE , DOT_SIZE , onMove]);

    return {position , setPosition};
};
