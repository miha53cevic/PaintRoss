const imageEffectName = [
    'none',
    'grayscale',
    'invert colors'
] as const;
export type ImageEffectType = typeof imageEffectName[number];

export default class ImageEffect {
    private constructor() {}

    public static GetImageEffect(name: ImageEffectType) {
        return imageEffectName.indexOf(name);
    }
}