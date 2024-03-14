import { mat4, vec2 } from "gl-matrix";
import GLMath from "./glmath";

export default class Camera2D {
    private projMat: mat4 = mat4.create();
    private viewMat: mat4 = mat4.create();
    private pan: vec2 = vec2.fromValues(0, 0);
    private zoom: number = 1.0;
    private zoomCenter: vec2 = vec2.fromValues(0, 0);

    constructor(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this.updateViewMatrix(0, 0, 1.0);
        this.updateProjectionMatrix(screenWidth, screenHeight, left, top, near, far);
    }

    private updateViewMatrix(x: number, y: number, zoom: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        this.viewMat = GLMath.createViewMatrix2D(vec2.fromValues(x, y), zoom, zoomCenter);
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

    public GetPos() {
        return this.pan;
    }

    public SetPan(x: number, y: number) {
        this.pan = vec2.fromValues(x, y);
        this.updateViewMatrix(x, y, this.zoom, this.zoomCenter);
    }

    public SetZoom(zoomFactor: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        this.zoom = zoomFactor;
        this.zoomCenter = zoomCenter;
        this.updateViewMatrix(this.pan[0], this.pan[1], zoomFactor, zoomCenter);
    }
}