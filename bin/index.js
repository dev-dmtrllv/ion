#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const [, , cliScript = "", ...args] = process.argv;
const cwd = process.cwd();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = require("./commands/" + cliScript).default;
        yield command(cwd, ...args);
    }
    catch (e) {
        // if (e.code !== "MODULE_NOT_FOUND")
        console.log(e);
        console.log(`"${cliScript}" is not a valid command!`);
    }
});
main();
