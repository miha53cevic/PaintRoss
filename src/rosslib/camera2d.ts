import { mat4, vec2 } from "gl-matrix";
import GLMath from "./glmath";

export default class Camera2D {
    private _projMat: mat4 = mat4.create();
    private _viewMat: mat4 = mat4.create();

    public MaxZoom: number = 100.0;
    public MinZoom: number = 0.1;

    constructor(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this._viewMat = GLMath.CreateViewMatrix2D();
        this.UpdateProjectionMatrix(screenWidth, screenHeight, left, top, near, far);
    }

    public UpdateProjectionMatrix(screenWidth: number, screenHeight: number, left: number = 0, top: number = 0, near: number = -1, far: number = 1) {
        this._projMat = GLMath.CreateOrthoProjectionMatrix(left, screenWidth, screenHeight, top, near, far);
    }

    public GetProjMatrix() {
        return this._projMat;
    }

    public GetViewMatrix() {
        return this._viewMat;
    }

    public PanBy(x: number, y: number) {
        this._viewMat = GLMath.UpdateViewMatrixPanning(this._viewMat, vec2.fromValues(x, y));
    }

    public ZoomBy(zoomBy: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        const currentZoom = GLMath.GetViewMatrixScale(this._viewMat)[0];
        if (zoomBy > 0 && currentZoom >= this.MaxZoom) return;
        if (zoomBy < 0 && currentZoom <= this.MinZoom) return;

        this._viewMat = GLMath.UpdateViewMatrixZooming(this._viewMat, 1 + zoomBy, zoomCenter);
    }

    public MouseToWorld2D(mouseX: number, mouseY: number, canvasWidth: number, canvasHeight: number) {
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