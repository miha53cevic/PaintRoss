const ImageEffectNames = ['None', 'Grayscale', 'InvertColors'] as const;
export type ImageEffectType = (typeof ImageEffectNames)[number];

export default class ImageEffect {
    private constructor() {}

    public static GetImageEffect(name: ImageEffectType) {
        return ImageEffectNames.indexOf(name);
    }
}
