import { isPicture } from "../util/image";

export const addFile = (f, file) => {
    const fd = new FormData();
    fd.append('path', f);
    fd.append('isDir', 'false');
    fd.append('file', file);
    return fetch('/api/file/putFile', {
        method: 'POST',
        body: fd
    });
}
export const addFolder = (f) => {
    const fd = new FormData();
    fd.append('path', f);
    fd.append('isDir', 'true');
    return fetch('/api/file/putFile', {
        method: 'POST',
        body: fd
    });
}

export const removeFolder = (f) => {
    return fetch('/api/file/removeFile', {
        method: 'POST',
        body: JSON.stringify({ path: f }),
    })
};

export const removeFile = (f) => {
    return fetch('/api/file/removeFile', {
        method: 'POST',
        body: JSON.stringify({ path: f }),
    })
};

export const renameFile = (f, nf) => {
    return fetch('/api/file/renameFile', {
        method: 'POST',
        body: JSON.stringify({ path: f, newPath: nf }),
    });
}

export const getFiles = (f) => {
    return fetch('/api/file/readDir', {
        method: 'POST',
        body: JSON.stringify({path: f})
    }).then(res => res.json())
        .then((data => {
            return data.data.map(g => {
                const path = f + '/' + g.name;
                const u = path.split('/').map(x => encodeURI(x));
                u.splice(0, 2);
                const url = '/' + u.join('/')
                return {
                    name: g.name,
                    updated: g.updated,
                    type: g.isDir ? 'folder' : 'file',
                    isPicture: isPicture(g.name),
                    path,
                    url,
                };
            });
        }))
};

