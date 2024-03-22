export default function (width: number, height: number, imageData: Uint8Array): Uint8Array {
    const flippedData = new Uint8Array(imageData.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const flippedIndex = ((height - y - 1) * width + x) * 4;
            flippedData[flippedIndex + 0] = imageData[index];
            flippedData[flippedIndex + 1] = imageData[index + 1];
            flippedData[flippedIndex + 2] = imageData[index + 2];
            flippedData[flippedIndex + 3] = imageData[index + 3];
        }
    }
    return flippedData;
}