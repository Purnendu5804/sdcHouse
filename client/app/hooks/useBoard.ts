import { useState , useEffect } from "react";

interface MapObject {
    id : string;
    type : string;
    x : number;
    y : number;
    width : number;
    height : number;
}

interface UseBoardProps {
    BOARD_WIDTH : number,
    BOARD_HEIGHT : number
    STEP_SIZE : number,
    DOT_SIZE : number,
    onMove : (data : {x : number ; y : number ; direction : string , isMoving : boolean}) => void;
    hasJoined : boolean,
    mapObjects : MapObject[]
}

export const useBoard = ({BOARD_WIDTH, BOARD_HEIGHT ,STEP_SIZE , DOT_SIZE , onMove , hasJoined , mapObjects , } : UseBoardProps) => {
    // local dot set karne ke liye
    const [position , setPosition] = useState({x : BOARD_WIDTH / 2 , y : BOARD_HEIGHT / 2});
    //which player is facing where
    const [direction , setDirection] = useState<'up' | 'down' | 'left' | 'right'> ('down')

    //track karne ke liye if legs should be moving or not
    const[isMoving , setIsMoving] = useState(false);

    useEffect(() => {
        if(!hasJoined) return;
        const handleKeyDown = (e : KeyboardEvent) => {
            if(["ArrowUp" , "ArrowDown" , "ArrowLeft" , "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            setIsMoving(true);
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
                const willCollide = mapObjects.some((obj) => {
                    if(obj.type === 'rug') return false ;

                    return (
                        newX < obj.x + obj.width &&
                        newX + DOT_SIZE > obj.x &&
                        newY < obj.y + obj.height &&
                        newY + DOT_SIZE > obj.y
                    );
                });

                if(willCollide) {   //even if blocked we will update direction so the player faces the object(desk etc.)
                    setDirection(newDir);

                    if(newDir !== direction) {
                        onMove({x : prev.x , y : prev.y , direction : newDir , isMoving : true});
                    }

                    return prev; // reject the position change
                }

                // if no collision proceed normally

                setDirection(newDir);

                if(newX !== prev.x || newY !== prev.y) {
                    onMove({x : newX , y : newY , direction : newDir , isMoving : true});
                }

                return {x : newX , y : newY};
            }

            return prev;
            
        });
    };

    //stop walking ke liye

    const handleKeyUp = (e: KeyboardEvent) => {
            if(["ArrowUp" , "ArrowDown" , "ArrowLeft" , "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                setIsMoving(false); // Stop the leg animation locally
                
                // CRITICAL: We must tell the server we stopped, so others see us stop!
                // We use nested updaters to grab the absolute latest state variables
                setPosition((prevPos) => {
                setDirection((prevDir) => {
                        onMove({ x: prevPos.x, y: prevPos.y, direction: prevDir, isMoving: false });
                        return prevDir;
                    });
                    return prevPos;
                });
            }
        };

        window.addEventListener("keydown" , handleKeyDown);
        window.addEventListener("keyup" , handleKeyUp)
        return() => {
            window.removeEventListener("keydown" , handleKeyDown)
            window.removeEventListener("keyup" , handleKeyUp); 
        };
    },[hasJoined , BOARD_WIDTH , BOARD_HEIGHT , STEP_SIZE , DOT_SIZE , onMove , direction]);


    return {position , direction , isMoving};
};