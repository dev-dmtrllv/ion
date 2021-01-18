"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genProject = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
const genProject = (projectDir) => {
    const templatePath = path_1.default.resolve(__dirname, "../../template-project");
    const projectFiles = utils_1.getFilesRecursive(templatePath);
    projectFiles.forEach(p => {
        const dest = p.replace(templatePath, projectDir);
        const destDir = dest.substr(0, dest.length - (path_1.default.basename(dest).length + 1));
        fs_1.default.mkdirSync(destDir, { recursive: true });
        fs_1.default.copyFileSync(p, dest);
    });
};
exports.genProject = genProject;
