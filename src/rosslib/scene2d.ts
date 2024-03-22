import Object2D from "./objects/object2d";
import Camera2D from "./camera2d";

export default class Scene2d {
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
        return this.objects2d[index];
    }

    public Clear() {
        this.objects2d = [];
    }
}