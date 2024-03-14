export default interface Tool {
    onMouseDown(x: number, y: number, mouseButton: number): void,
    onMouseUp(x: number, y: number, mouseButton: number): void;
    onMouseMove(x: number, y: number): void,
}