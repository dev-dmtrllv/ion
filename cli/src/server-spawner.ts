import path from "path";
import { IIonConfig } from "./config/ion-config";
import { initTsLoader } from "./init-ts-loader";

const [, , ionConfigStr, projectDir = process.cwd()] = process.argv;

(async () => 
{
	if (ionConfigStr)
	{
		const ionConfig: IIonConfig = JSON.parse(ionConfigStr);
		const serverEntry = path.resolve(projectDir, "src", "server", ionConfig.server.entry || "index.ts");

		(global as any).env = {
			isDev: true,
			isServer: true,
			isClient: false,
		};

		initTsLoader();

		const ServerClass = require(serverEntry).default;
		const server = new ServerClass(ionConfig);
		await server.listen();
	}
})();
