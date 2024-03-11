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

    static createTransformationMatrix2D(position: vec2, rotation: number, scale: vec2) {
        const mat = this.createTransformationMatrix(
            vec3.fromValues(position[0], position[1], 0),
            vec3.fromValues(0, 0, rotation),
            vec3.fromValues(scale[0], scale[1], 1),
        );
        return mat;
    }

    static createViewMatrix2D(position: vec2) {
        const mat = mat4.create();
        mat4.fromTranslation(mat, vec3.fromValues(-position[0], -position[1], 0));
        return mat;
    }

    static createOrthoProjectionMatrix(screenWidth: number, screenHeight: number, nearPlane: number = -1, farPlane: number = 1) {
        const mat = mat4.create();
        mat4.ortho(mat, 0, screenWidth, screenHeight, 0, nearPlane, farPlane);
        return mat;
    }

    static toRadian(degress: number) {
        return glMatrix.toRadian(degress);
    }
}