import { glMatrix, mat4, vec2, vec3 } from "gl-matrix";

export default class GLMath {

    static createTransformationMatrix(position: vec3, rotation: vec3, scale: vec3) {
        const mat = mat4.create();
        mat4.fromTranslation(mat, position);
        mat4.rotateX(mat, mat, this.toRadian(rotation[0]));
        mat4.rotateY(mat, mat, this.toRadian(rotation[1]));
        mat4.rotateZ(mat, mat, this.toRadian(rotation[2]));
        mat4.scale(mat, mat, scale);
        return mat;
    }

    static createTransformationMatrix2D(position: vec2, rotation: number, size: vec2) {
        const mat = mat4.create();
        mat4.fromTranslation(mat, vec3.fromValues(position[0], position[1], 0));

        // rotate around the center of the object by translating it so that 0,0 is in the middle of the object
        mat4.translate(mat, mat, vec3.fromValues(0.5 * size[0], 0.5 * size[1], 0.0));
        mat4.rotateZ(mat, mat, this.toRadian(rotation));
        mat4.translate(mat, mat, vec3.fromValues(-0.5 * size[0], -0.5 * size[1], 0.0));

        // scale is size since topLeft is 0,0 and size of the quad is 1
        mat4.scale(mat, mat, vec3.fromValues(size[0], size[1], 1));
        return mat;
    }

    static createViewMatrix2D(pan: vec2 = vec2.fromValues(0, 0), zoom: number = 1.0, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        let mat = mat4.create();
        mat = this.updateViewMatrixZooming(mat, zoom, zoomCenter);
        mat = this.updateViewMatrixPanning(mat, pan);
        return mat;
    }

    static getViewMatrixScale(viewMatrix: mat4): vec3 {
        const scale = vec3.create();
        mat4.getScaling(scale, viewMatrix);
        return scale;
    }

    // Useful when needing to do extra zoom in on already transformed viewMatrix, because then you need to right multiply by oldViewMat to keep previous transformations
    static updateViewMatrixZooming(viewMatrix: mat4, zoom: number, zoomCenter: vec2 = vec2.fromValues(0, 0)) {
        const zoomMatrix = mat4.create();
        mat4.fromTranslation(zoomMatrix, vec3.fromValues(zoomCenter[0], zoomCenter[1], 0)); // move scale origin to the zoom center
        mat4.scale(zoomMatrix, zoomMatrix, vec3.fromValues(zoom, zoom, 1.0)); // scale/zoom
        mat4.translate(zoomMatrix, zoomMatrix, vec3.fromValues(-zoomCenter[0], -zoomCenter[1], 0)); // bring back the origin

        const updatedViewMatrix = mat4.create();
        mat4.multiply(updatedViewMatrix, zoomMatrix, viewMatrix); // order matters! (newViewMat * oldViewMat)
        return updatedViewMatrix;
    }

    static updateViewMatrixPanning(viewMatrix: mat4, pan: vec2, panSpeed: number = 1.0) {
        const translationMatrix = mat4.create();
        mat4.fromTranslation(translationMatrix, vec3.fromValues(pan[0] * panSpeed, pan[1] * panSpeed, 0));

        const updatedViewMatrix = mat4.create();
        mat4.multiply(updatedViewMatrix, translationMatrix, viewMatrix);
        return updatedViewMatrix;
    }

    static createOrthoProjectionMatrix(left: number, right: number, bottom: number, top: number, nearPlane: number = -1, farPlane: number = 1) {
        const mat = mat4.create();
        mat4.ortho(mat, left, right, bottom, top, nearPlane, farPlane);
        return mat;
    }

    static toRadian(degress: number) {
        return glMatrix.toRadian(degress);
    }
}