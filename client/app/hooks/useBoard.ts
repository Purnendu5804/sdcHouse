import { useState , useEffect } from "react";

interface UseBoardProps {
    BOARD_WIDTH : number,
    BOARD_HEIGHT : number
    STEP_SIZE : number,
    DOT_SIZE : number,
    onMove : (data : {x : number ; y : number ; direction : string}) => void;
    hasJoined : boolean
}

export const useBoard = ({BOARD_WIDTH, BOARD_HEIGHT ,STEP_SIZE , DOT_SIZE , onMove , hasJoined} : UseBoardProps) => {
    // local dot set karne ke liye
    const [position , setPosition] = useState({x : BOARD_WIDTH / 2 , y : BOARD_HEIGHT / 2});
    //which player is facing where
    const [direction , setDirection] = useState<'up' | 'down' | 'left' | 'right'> ('down')

    useEffect(() => {
        if(!hasJoined) return;
        const handleKeyDown = (e : KeyboardEvent) => {
            if(["ArrowUp" , "ArrowDown" , "ArrowLeft" , "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }

        setPosition((prev) => {
            let newX = prev.x;
            let newY = prev.y;
            let newDir : 'up' | 'down' | 'left' | 'right' | null = null;
            

            if (e.key === "ArrowUp") { newY = Math.max(0, prev.y - STEP_SIZE); newDir = 'up'; }
            if (e.key === "ArrowDown") { newY = Math.min(BOARD_HEIGHT - DOT_SIZE, prev.y + STEP_SIZE); newDir = 'down'; }
            if (e.key === "ArrowLeft") { newX = Math.max(0, prev.x - STEP_SIZE); newDir = 'left'; }
            if (e.key === "ArrowRight") { newX = Math.min(BOARD_WIDTH - DOT_SIZE, prev.x + STEP_SIZE); newDir = 'right'; }


            if(newDir) {
                setDirection(newDir);

                if(newX !== prev.x || newY !== prev.y) {
                    onMove ({x : newX , y : newY , direction : newDir});
                }
                return { x : newX , y : newY};
            }

            return prev;
            
        });
    };

    window.addEventListener("keydown" , handleKeyDown);
    return () => window.removeEventListener("keydown" , handleKeyDown);
    } , [hasJoined , BOARD_WIDTH , BOARD_HEIGHT , STEP_SIZE , DOT_SIZE , onMove]);

    return {position , direction};
};