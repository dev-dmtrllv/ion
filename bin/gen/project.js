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
    utils_1.writeJson(path_1.default.resolve(projectDir, "tsconfig.json"), {
        "compilerOptions": {
            "rootDir": "./src",
            "outDir": "./dist",
            "esModuleInterop": true,
            "module": "ESNext",
            "target": "ES6",
            "moduleResolution": "Node",
            "allowSyntheticDefaultImports": true,
            "strictNullChecks": true,
            "resolveJsonModule": true,
            "jsx": "preserve",
            "experimentalDecorators": true,
            "baseUrl": "./src",
            "paths": {
                "server/*": [
                    "server/*"
                ],
                "app/*": [
                    "app/*"
                ]
            }
        },
        "include": [
            "./src/**/*"
        ],
        "exclude": [
            "node_modules/**/*"
        ]
    });
    utils_1.writeJson(path_1.default.resolve(projectDir, "ion.secret.json"), {
        "database": {
            "user": "PRODUCTION_USER_NAME",
            "password": "PRODUCTION_PASSWORD"
        },
        "server": {
            "session": {
                "secret": "PRODUCTION_SECRET"
            }
        }
    });
    utils_1.write(path_1.default.resolve(projectDir, ".gitignore"), `ion.secrets.json
manifest.json
node_modules
dist
`);
};
exports.genProject = genProject;
