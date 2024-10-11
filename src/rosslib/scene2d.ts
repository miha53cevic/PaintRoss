import Camera2D from "./camera2d";
import Object2D from "./objects/object2d";

export default class Scene2D {
    private _objects2d: Object2D[] = [];

    public Render(camera2d: Camera2D) {
        for (const object2d of this._objects2d) {
            object2d.Render(camera2d);
        }
    }

    public Add(object2d: Object2D | Object2D[]) {
        if (Array.isArray(object2d)) {
            this._objects2d = this._objects2d.concat(object2d);
        }
        else this._objects2d.push(object2d);
    }

    public Get(index: number) {
        if (index < 0 || index >= this._objects2d.length) 
            throw new Error("Object2D index out of range");
        return this._objects2d[index];
    }

    public GetObjectsLength() {
        return this._objects2d.length;
    }

    public Clear() {
        this._objects2d = [];
    }
}