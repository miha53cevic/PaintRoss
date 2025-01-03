export type Kernel = [number, number, number, number, number, number, number, number, number];
export type KernelOperation = 'Normal' | 'GaussianBlur' | 'Sharpen' | 'EdgeDetect' | 'BoxBlur';

const KernelOperations = new Map<KernelOperation, Kernel>([
    ['Normal', [0, 0, 0, 0, 1, 0, 0, 0, 0]],
    ['GaussianBlur', [0, 1, 0, 1, 1, 1, 0, 1, 0]],
    ['Sharpen', [0, -1, 0, -1, 5, -1, 0, -1, 0]],
    ['EdgeDetect', [-1, -1, -1, -1, 8, -1, -1, -1, -1]],
    ['BoxBlur', [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111]],
]);

export default class ImageKernel {
    private constructor() {}

    public static ComputeKernelWeight(kernel: Kernel): number {
        const weight = kernel.reduce((prev, curr) => prev + curr);
        return weight <= 0 ? 1 : weight;
    }

    public static GetKernel(name: KernelOperation): Kernel {
        return KernelOperations.get(name)!;
    }
}
