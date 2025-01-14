import Texture from '../glo/texture';

export default class CanvasClipboard {
    private _texture: Texture | null = null;

    public SaveTexture(texture: Texture) {
        this._texture = texture;
    }

    public GetTexture() {
        return this._texture;
    }
}
