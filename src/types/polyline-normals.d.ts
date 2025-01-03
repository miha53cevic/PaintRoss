/* eslint-disable @typescript-eslint/naming-convention */

declare module 'polyline-normals' {
    function polyline_normals(points: [number, number][], closed: boolean): [[number, number], number][];
    export = polyline_normals;
}
