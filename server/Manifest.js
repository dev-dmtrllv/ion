"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manifest = void 0;
class Manifest {
    constructor(data) {
        this.getTargetedFiles = (target, chunkName, type) => { var _a; return (((_a = this.data[target][chunkName]) === null || _a === void 0 ? void 0 : _a.files.filter(s => s.endsWith(type))) || []); };
        this.getChunkFiles = (chunkIDs) => {
            const data = {
                styles: [],
                scripts: [],
            };
            chunkIDs.forEach(path => {
                path = path.replace(/.tsx?/, "");
                if (this.data.chunks[path]) {
                    data.scripts.push(...this.getTargetedFiles("chunks", path, "js"));
                    data.styles.push(...this.getTargetedFiles("chunks", path, "css"));
                }
            });
            return data;
        };
        this.getAppFiles = (name) => {
            return {
                scripts: [...this.getTargetedFiles("main", name, "js")],
                styles: [...this.getTargetedFiles("main", name, "css")],
            };
        };
        this.data = data;
        this.runtime = {
            scripts: [...this.getTargetedFiles("main", "runtime", "js"), ...this.getTargetedFiles("main", "vendor", "js")],
            styles: [...this.getTargetedFiles("main", "runtime", "css"), ...this.getTargetedFiles("main", "vendor", "css")],
        };
    }
}
exports.Manifest = Manifest;
