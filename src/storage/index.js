import {
    getFile,
    addFile,
    addFolder,
    removeFolder,
    getFiles,
    removeFile,
} from './file';
import { reactive } from 'vue';
import { FILE_EXT, VIDEO_EXT } from '../util/constants';
import { MD5 } from '../util/md5';
import lrz from 'lrz';

export class Storage {
    folders = reactive([]);

    basePath = '/data/public/siyuan-plugin-picture-library';

    constructor(conf) {
        this.plugin = conf.plugin;
    }

    init(folders) {
        this.folders = folders;
    }

    getFolderByPath(folders, path) {
        for (const f of folders) {
            if (f.path === path) {
                if (f.type === 'folder') {
                    return f;
                } else {
                    return null;
                }
            }
            const result = this.getFolderByPath(f.folders, path);
            if (result === null) {
                return result;
            }
            if (result) {
                return result;
            }
        }
        return undefined;
    }

    addRootFolder(name) {
        return addFolder(`${this.basePath}/${name}`).then(() => this.folders.push({
            type: 'folder',
            path: `${this.basePath}/${name}`,
            name,
            folders: [],
            files: [],
            isRoot: true,
        })).then(() => this.plugin.saveFiles())
    }

    removeRootFolder(name) {
        return removeFolder(`${this.basePath}/${name}`).then(() => {
            this.folders.splice(this.folders.find((folder) => folder.path === `${this.basePath}/${name}`), 1);
        }).then(() => this.plugin.saveFiles())
    }

    addFolder(path, name) {
        const folder = this.getFolderByPath(this.folders, path);
        if (!folder) {
            return;
        }
        return addFolder(`${folder.path}/${name}`).then(() => {
            const node = reactive({
                type: 'folder',
                path: `${folder.path}/${name}`,
                name,
                folders: [],
                files: [],
                isRoot: false,
            });
            folder.folders.push(node);

        }).then(() => this.plugin.saveFiles())
    }

    removeFolder(path, name) {
        const p = path.split('/');
        p.pop();
        const np = p.join('/')
        const folder = this.getFolderByPath(this.folders, np);
        if (!folder) {
            return;
        }
        return removeFolder(`${np}/${name}`).then(() => {
            folder.folders.splice(folder.folders.find((folder) => folder.path === `${np}/${name}`), 1);
        }).then(() => this.plugin.saveFiles())
    }

    getNodes() {
        return this.folders;
    }

    async refresh() {
        const tree = [];
        await this.getFolders(tree, this.basePath);
        this.folders.splice(0, this.folders.length);
        tree.forEach((t => this.folders.push(t)));
        this.plugin.saveFiles();
    }

    async getFolders(tree, path) {
        const files = await getFiles(path);
        for (const file of files) {
            if (file.type === 'folder') {
                const folder = {
                    type: file.type,
                    path: file.path,
                    isRoot: path === this.basePath,
                    name: file.name,
                    folders: [],
                    files: [],
                }
                tree.push(folder);
                await this.getFolders(folder.folders, folder.path);
            }
        }
    }

    async addFiles(p, files) {
        return Promise.all(Array.from(files).filter(f => FILE_EXT.concat(VIDEO_EXT).some(g => f.name.toLowerCase().endsWith(g))).map(f => {
            const fp = `${p}/${f.name}`;
            return addFile(fp, f.file);
        }));
    }

    async addFileBlob(p, fileBlob, filename) {
        return addFile(p + '/' + filename, fileBlob)
    }

    async deleteFile(p) {
        return removeFile(p);
    }

    async getHash(p) {
        return MD5(p);
    }

    async getCacheOfPicture(p) {
        const md5 = await this.getHash(p);
        const res = await getFile('/data/storage/petal/siyuan-plugin-picture-library/.cache/' + md5)
        if (typeof res === 'string') {
            return res;
        }
        const code = res.code;
        if (code === 404) {
            const img = await lrz(p)
                .then(function (rst) {
                    return rst.base64;
                })
            await addFile('/data/storage/petal/siyuan-plugin-picture-library/.cache/' + md5, new Blob([img]))
            return img;
        } else {
            console.log(res);
            return res;
        }
    }
}

