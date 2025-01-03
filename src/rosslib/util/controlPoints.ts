export type Point = [number, number];

export function InRect(point: Point, rectTopLeft: Point, rectSize: Point): boolean {
    const dx = point[0] - rectTopLeft[0];
    const dy = point[1] - rectTopLeft[1];

    // If dx or dy are negative the point is on the left or above the rect
    if (dx < 0 || dy < 0) return false;
    // If dx or dy are greater then rectPos+rectSize then mouse is right or bottom of rect
    if (dx > rectSize[0] || dy > rectSize[1]) return false;
    // Otherwise point is in rect
    return true;
}

export function GetTouchingControlPoint(
    mousePos: Point,
    controlPoints: Point[],
    controlPointSize: Point,
): Point | null {
    for (const cp of controlPoints) {
        const cpTopLeft: Point = [cp[0] - controlPointSize[0] / 2, cp[1] - controlPointSize[1] / 2];
        if (InRect(mousePos, cpTopLeft, controlPointSize)) {
            return cp;
        }
    }
    return null;
}
