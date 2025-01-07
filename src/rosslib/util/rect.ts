export default class Rect {
    public Position: [number, number];
    public Size: [number, number];

    constructor(position: [number, number], size: [number, number]) {
        this.Position = position;
        this.Size = size;
    }
}
