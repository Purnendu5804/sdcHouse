type point = {x : number , y : number};

export function calculateDistance(p1 : point , p2 : point) : number {
    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;


    return Math.sqrt(Math.pow(deltaX , 2) + Math.pow(deltaY , 2));
}