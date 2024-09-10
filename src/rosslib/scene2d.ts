import Camera2D from "./camera2d";
import Object2D from "./objects/object2d";

export default class Scene2D {
    private objects2d: Object2D[] = [];

    public Render(camera2d: Camera2D) {
        for (const object2d of this.objects2d) {
            object2d.Render(camera2d);
        }
    }

    public Add(object2d: Object2D | Object2D[]) {
        if (Array.isArray(object2d)) {
            this.objects2d = this.objects2d.concat(object2d);
        }
        else this.objects2d.push(object2d);
    }

    public Get(index: number) {
        if (index < 0 || index >= this.objects2d.length) 
            throw new Error("Object2D index out of range");
        return this.objects2d[index];
    }

    public GetObjectsLength() {
        return this.objects2d.length;
    }

    public Clear() {
        this.objects2d = [];
    }
}