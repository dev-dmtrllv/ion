"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTsLoader = void 0;
const babel_config_1 = require("./config/babel-config");
const override_require_1 = require("./override-require");
const initTsLoader = () => {
    require("@babel/register")(babel_config_1.createBabelConfig("server"));
    override_require_1.overrideRequire();
};
exports.initTsLoader = initTsLoader;
