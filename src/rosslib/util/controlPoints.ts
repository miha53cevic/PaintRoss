import CanvasObject from '../objects/canvasObject';
import CircleObject from '../objects/circleObject';
import QuadObject from '../objects/quadObject';

export type Point = [number, number];

export function HalfPoint(p1: Point, p2: Point): Point {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

export class ControlPoint {
    public Position: Point;
    public Size: number;
    public Selected: boolean = false;

    constructor(position: Point, size: number = 10) {
        this.Position = position;
        this.Size = size;
    }

    public IsPointInControlPoint(point: Point) {
        const dx = point[0] - this.Position[0];
        const dy = point[1] - this.Position[1];

        // If dx or dy are less than negative half the size the point is on the left or above the rect
        if (dx < -this.Size / 2 || dy < -this.Size / 2) return false;
        // If dx or dy are greater then half size then mouse is right or bottom of controlPoint
        if (dx > this.Size / 2 || dy > this.Size / 2) return false;
        // Otherwise point is in controlPoint
        return true;
    }
}

export class ControllablePoints {
    public ControlPoints: ControlPoint[];

    constructor(controlPoints: ControlPoint[] = []) {
        this.ControlPoints = controlPoints;
    }

    public SetSize(size: number) {
        this.ControlPoints.forEach((cp) => (cp.Size = size));
    }

    public GetTouching(mousePos: Point): ControlPoint | null {
        for (const cp of this.ControlPoints) {
            if (cp.IsPointInControlPoint(mousePos)) {
                return cp;
            }
        }
        return null;
    }

    public GetSelected(): ControlPoint | null {
        return this.ControlPoints.find((cp) => cp.Selected === true) || null;
    }

    public Select(controlPoint: ControlPoint | null) {
        for (const cp of this.ControlPoints) {
            if (cp === controlPoint) cp.Selected = true;
            else cp.Selected = false;
        }
    }

    public GetPositions(): Point[] {
        const points: Point[] = [];
        for (const cp of this.ControlPoints) {
            points.push(cp.Position);
        }
        return points;
    }

    public Render(gl: WebGL2RenderingContext, canvasObj: CanvasObject, type: 'quads' | 'circles' = 'circles') {
        if (type === 'circles') this.RenderCircles(gl, canvasObj);
        else this.RenderQuads(gl, canvasObj);
    }

    private RenderCircles(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        const circle = new CircleObject(gl);
        for (const cp of this.ControlPoints) {
            circle.Size = [cp.Size, cp.Size];
            if (cp.Selected) {
                circle.SetColour([255, 255, 0, 255]);
            } else circle.SetColour([255, 0, 0, 255]);
            circle.Position = [cp.Position[0] - cp.Size / 2, cp.Position[1] - cp.Size / 2];
            canvasObj.DrawOnCanvas(circle);
        }
    }

    private RenderQuads(gl: WebGL2RenderingContext, canvasObj: CanvasObject) {
        const quad = new QuadObject(gl);
        for (const cp of this.ControlPoints) {
            quad.Size = [cp.Size, cp.Size];
            if (cp.Selected) {
                quad.Colour = [255, 255, 0, 255];
            } else quad.Colour = [255, 0, 0, 255];
            quad.Position = [cp.Position[0] - cp.Size / 2, cp.Position[1] - cp.Size / 2];
            canvasObj.DrawOnCanvas(quad);
        }
    }
}
