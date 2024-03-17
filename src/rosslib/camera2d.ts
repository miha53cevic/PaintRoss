import { mat4, vec2 } from "gl-matrix";
import GLMath from "./glmath";

export default class Camera2D {
    private projMat: mat4 = mat4.create();
    private viewMat: mat4 = mat4.create();

    public totalZoom: number = 1.0;
    public maxZoom: number = 5.0;
    public minZoom: number = 0.1;

    constructor(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this.viewMat = GLMath.createViewMatrix2D();
        this.updateProjectionMatrix(screenWidth, screenHeight, left, top, near, far);
    }

    public updateProjectionMatrix(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this.projMat = GLMath.createOrthoProjectionMatrix(left, screenWidth, screenHeight, top, near, far);
    }

    public GetProjMatrix() {
        return this.projMat;
    }

    public GetViewMatrix() {
        return this.viewMat;
    }

    public PanBy(x: number, y: number) {
        this.viewMat = GLMath.updateViewMatrixPanning(this.viewMat, vec2.fromValues(x, y));
    }

    public ZoomBy(zoomBy: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        if (this.totalZoom + zoomBy < this.minZoom || this.totalZoom + zoomBy > this.maxZoom) return;
        this.totalZoom += zoomBy;
        // When zooming on an already transformed image, you need to right multiply by previous viewMatrix to keep the transforms
        this.viewMat = GLMath.updateViewMatrixZooming(this.viewMat, 1 + zoomBy, zoomCenter);
    }

    public mouseToWorld2D(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number) {
        // Convert mouse coordinates to clip space (-1 to 1)
        const clipX = (mouseX / canvasWidth) * 2 - 1;
        const clipY = 1 - (mouseY / canvasHeight) * 2;

        // Multiply projection matrix and view matrix
        const viewProjMat = mat4.create();
        mat4.multiply(viewProjMat, this.GetProjMatrix(), this.GetViewMatrix());

        // Get inverse of combined matrix
        const inverseMat = mat4.create();
        mat4.invert(inverseMat, viewProjMat);

        // Transform clip space coordinates to world coordinates
        const worldPos = vec2.fromValues(clipX, clipY);
        vec2.transformMat4(worldPos, worldPos, inverseMat);

        // Return 2D world coordinates
        return vec2.fromValues(worldPos[0], worldPos[1]);
    }
}