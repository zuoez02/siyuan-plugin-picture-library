import { FILE_EXT } from "./constants";

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
    return FILE_EXT.some((ext) => name?.endsWith(ext));
}