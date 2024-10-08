import { FILE_EXT, VIDEO_EXT } from "./constants";

export const getPngFunc = (path) => {
    return new Promise((resolve) => {
        const img = new Image;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');

        (function setCanvasImage(path, func) {
            img.onload = function () {
                c.width = this.naturalWidth
                c.height = this.naturalHeight
                ctx.drawImage(this, 0, 0)
                c.toBlob(blob => {
                    func(blob)
                }, 'image/png');
            }
            img.src = path
        })(path, resolve)
    })
}

export const isPicture = (name)=> {
    return !name?.startsWith('.') && FILE_EXT.some((ext) => name?.toLowerCase().endsWith(ext));
}

export const isVideo = (name) => {
    return !name?.startsWith('.') && VIDEO_EXT.some((ext) => name?.toLowerCase().endsWith(ext));
}