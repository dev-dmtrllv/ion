import { createBabelConfig } from "./config/babel-config";
import { overrideRequire } from "./override-require";

export const initTsLoader = () =>
{
	require("@babel/register")(createBabelConfig("server"));
	overrideRequire();
}
