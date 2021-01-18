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
exports.Server = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
class Server {
    constructor(projectPath, ionConfig) {
        this.didChange = false;
        this.isWatching = false;
        this.proc = null;
        this.watch = (onChange) => {
            if (!this.isWatching) {
                fs_1.default.watch(this.path, { recursive: true }, (e, file) => {
                    if (!this.didChange) {
                        this.didChange = true;
                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            yield this.start(true);
                            onChange && onChange();
                            this.didChange = false;
                        }), 0);
                    }
                });
            }
        };
        this.kill = () => new Promise((res) => {
            if (this.proc)
                this.proc.kill();
            setTimeout(res, 0);
        });
        this.start = (restart = false) => __awaiter(this, void 0, void 0, function* () {
            console.log(`${restart ? "re" : ""}starting server...`);
            yield this.kill();
            this.proc = child_process_1.fork(path_1.default.resolve(__dirname, "./server-spawner"), [JSON.stringify(this.ionConfig), this.projectPath]);
        });
        this.updateApp = () => {
            var _a;
            (_a = this.proc) === null || _a === void 0 ? void 0 : _a.send("update-app");
        };
        this.projectPath = projectPath;
        this.path = path_1.default.resolve(projectPath, "src", "server");
        this.ionConfig = ionConfig;
    }
}
exports.Server = Server;
