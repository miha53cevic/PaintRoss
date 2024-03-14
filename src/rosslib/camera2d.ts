import { mat4, vec2 } from "gl-matrix";
import GLMath from "./glmath";

export default class Camera2D {
    private projMat: mat4 = mat4.create();
    private viewMat: mat4 = mat4.create();
    
    public totalZoom: number = 1.0;
    public maxZoom: number = 5.0;
    public minZoom: number = 0.1;

    constructor(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this.viewMat = GLMath.createViewMatrix2D(vec2.fromValues(0, 0), 1.0);
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

    public SetPan(x: number, y: number) {
        this.viewMat = GLMath.updateViewMatrixPanning(this.viewMat, vec2.fromValues(x, y));
    }

    public ZoomBy(zoomBy: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        if (this.totalZoom + zoomBy < this.minZoom || this.totalZoom + zoomBy > this.maxZoom) return;
        this.totalZoom += zoomBy;
        // When zooming on an already transformed image, you need to right multiply by previous viewMatrix to keep the transforms
        this.viewMat = GLMath.updateViewMatrixZooming(this.viewMat, 1 + zoomBy, zoomCenter);
    }
}