"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestPlugin = void 0;
class ManifestPlugin {
    constructor(props) {
        this.transformPath = (p) => {
            if (p.startsWith("."))
                return p.substr(1, p.length);
            else if (!p.startsWith("/"))
                return "/" + p;
            else
                return p;
        };
        this.apply = (compiler) => {
            compiler.hooks.emit.tapAsync(ManifestPlugin.ID, (c, cb) => {
                const manifest = {
                    main: {},
                    chunks: {}
                };
                for (const { files, name, id } of c.chunks) {
                    if (name) {
                        const _files = [];
                        files.forEach((k, val) => _files.push(this.transformPath(val)));
                        manifest.main[name] = {
                            id,
                            files: _files
                        };
                    }
                }
                for (const { chunks, origins } of c.chunkGroups) {
                    const origin = origins && origins[0];
                    if (origin) {
                        const fileName = origin.request;
                        if (fileName && !fileName.includes("node_modules\\.gen") && !fileName.includes("node_modules/.gen")) {
                            for (const { id, files } of chunks) {
                                const _files = [];
                                files.forEach((k, val) => _files.push(this.transformPath(val)));
                                manifest.chunks[fileName] = {
                                    id,
                                    files: _files
                                };
                            }
                        }
                    }
                }
                this.props.onManifest(manifest);
                cb();
            });
        };
        this.props = props;
    }
}
exports.ManifestPlugin = ManifestPlugin;
ManifestPlugin.ID = "Ion_ManifestPlugin";
