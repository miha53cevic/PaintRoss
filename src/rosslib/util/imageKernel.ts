export type Kernel = [number, number, number, number, number, number, number, number, number];
export type KernelOperation = 'normal' | 'gaussianBlur' | 'sharpen' | 'edgeDetect' | 'boxBlur';

const kernelOperations = new Map<KernelOperation, Kernel>([
    [
        'normal',
        [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
        ]
    ],
    [
        'gaussianBlur',
        [
            0, 1, 0,
            1, 1, 1,
            0, 1, 0
        ],
    ],
    [
        'sharpen',
        [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ],
    ],
    [
        'edgeDetect',
        [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1
        ],
    ],
    [
        'boxBlur',
        [
            0.111, 0.111, 0.111,
            0.111, 0.111, 0.111,
            0.111, 0.111, 0.111
        ],
    ]
]);

export default class ImageKernel {
    private constructor() { }

    public static ComputeKernelWeight(kernel: Kernel): number {
        const weight = kernel.reduce((prev, curr) => prev + curr);
        return weight <= 0 ? 1 : weight;
    }

    public static GetKernel(name: KernelOperation): Kernel {
        return kernelOperations.get(name)!;
    }
}