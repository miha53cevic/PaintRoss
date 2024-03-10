export default class Clock {
    private _start: number = 0;
    private _end: number = 0;

    constructor() {
        this._start = Date.now();
    }

    // returns elapsed time (delta time)
    public Restart() {
        this._end = Date.now();
        const elapsed = this._end - this._start;
        this._start = this._end;
        return elapsed / 1000;
    }
}