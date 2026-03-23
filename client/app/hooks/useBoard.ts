import { useState, useEffect, useRef } from "react";

interface UseBoardProps {
    BOARD_SIZE: number;
    STEP_SIZE: number;
    DOT_SIZE: number;
    onMove: (newPos: { x: number; y: number; direction: string; isMoving: boolean }) => void;
    hasJoined: boolean;
}

export const useBoard = ({ BOARD_SIZE, STEP_SIZE, DOT_SIZE, onMove, hasJoined }: UseBoardProps) => {
    // local dot set karne ke liye
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState("down");
    const [isMoving, setIsMoving] = useState(false);

    const dirRef = useRef("down");
    const movingRef = useRef(false);

    useEffect(() => {
        dirRef.current = direction;
        movingRef.current = isMoving;
    }, [direction, isMoving]);

    useEffect(() => {
        if (!hasJoined) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            } else {
                return; // Ignore other keys
            }

            let newDir = dirRef.current;
            if (e.key === "ArrowUp") newDir = "up";
            if (e.key === "ArrowDown") newDir = "down";
            if (e.key === "ArrowLeft") newDir = "left";
            if (e.key === "ArrowRight") newDir = "right";

            setDirection(newDir);
            setIsMoving(true);

            setPosition((prev) => {
                let newX = prev.x;
                let newY = prev.y;

                if (e.key === "ArrowUp") newY = Math.max(0, prev.y - STEP_SIZE);
                if (e.key === "ArrowDown") newY = Math.min(BOARD_SIZE - DOT_SIZE, prev.y + STEP_SIZE);
                if (e.key === "ArrowLeft") newX = Math.max(0, prev.x - STEP_SIZE);
                if (e.key === "ArrowRight") newX = Math.min(BOARD_SIZE - DOT_SIZE, prev.x + STEP_SIZE);

                const newPos = { x: newX, y: newY };

                // triggering the callback for the socket to tell everyone that moved
                if (newX !== prev.x || newY !== prev.y || newDir !== dirRef.current || !movingRef.current) {
                    onMove({ ...newPos, direction: newDir, isMoving: true });
                }

                return newPos;
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                setIsMoving(false);
                setPosition(prev => {
                    // Send stopping state with latest position
                    onMove({ ...prev, direction: dirRef.current, isMoving: false });
                    return prev;
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [hasJoined, BOARD_SIZE, STEP_SIZE, DOT_SIZE, onMove]);

    return { 
        position: { ...position, direction, isMoving }, 
        setPosition,
        direction,
        isMoving
    };
};
