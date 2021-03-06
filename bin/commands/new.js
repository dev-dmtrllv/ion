"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const input_1 = require("../utils/input");
const ion_config_1 = require("../config/ion-config");
const spawn_1 = require("../utils/spawn");
const package_1 = require("../gen/package");
const project_1 = require("../gen/project");
const devDependencies = [
    "@types/express",
    "@types/node",
    "@types/react",
    "@types/react-dom"
];
const dependencies = [
    "dev-dmtrllv/ion",
    "react",
    "react-dom"
];
const newProject = (cwd, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    // check if project exists
    if (args[0] && fs_1.default.existsSync(path_1.default.resolve(cwd, args[0]))) {
        console.log(`ion project ${args[0]} already exists!`);
        return;
    }
    // get project name and project path
    const name = yield input_1.getInput("name", { defaultValue: args[0] ? path_1.default.basename(args[0]) : undefined });
    const projectPath = path_1.default.resolve(cwd, args[0] || name);
    // check if project exists
    if (fs_1.default.existsSync(projectPath)) {
        console.log(`ion project ${projectPath} already exists!`);
        return;
    }
    const withDatabase = yield input_1.getInput("use database? y/n", { defaultValue: "y" });
    // ask for database configuration 
    const databaseConfig = withDatabase === "y" ? {
        databaseName: yield input_1.getInput("database name"),
        user: yield input_1.getInput("username", { defaultValue: "root" }),
        password: yield input_1.getInput("password", { defaultValue: "root" }),
        host: yield input_1.getInput("host", { defaultValue: "localhost" }),
        port: Number(yield input_1.getInput("port", { defaultValue: "3306" })),
        maxPoolConnections: Number(yield input_1.getInput("max pool connections", { defaultValue: "10" })),
    } : undefined;
    // create the project directory
    fs_1.default.mkdirSync(projectPath, { recursive: true });
    // create the ion configuration 
    const ionConfig = new ion_config_1.IonConfig(projectPath, ion_config_1.IonConfig.defaultConfig.apps, ion_config_1.IonConfig.defaultConfig.server, databaseConfig);
    ionConfig.save();
    // create the package.json
    package_1.genPackageJson(projectPath, name);
    // install all dependencies
    yield spawn_1.spawn("npm", ["i", "--save", ...dependencies], projectPath);
    yield spawn_1.spawn("npm", ["i", "--save-dev", ...devDependencies], projectPath);
    // generate startup project
    project_1.genProject(projectPath);
});
exports.default = newProject;
