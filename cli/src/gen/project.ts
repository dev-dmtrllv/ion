import path from "path";
import fs from "fs";
import { getFilesRecursive, write, writeJson } from "../utils";

export const genProject = (projectDir: string) =>
{
	const templatePath = path.resolve(__dirname, "../../template-project");
	const projectFiles = getFilesRecursive(templatePath);
	projectFiles.forEach(p => 
	{
		const dest = p.replace(templatePath, projectDir);
		const destDir = dest.substr(0, dest.length - (path.basename(dest).length + 1));
		fs.mkdirSync(destDir, { recursive: true });
		fs.copyFileSync(p, dest);
	});

	writeJson(path.resolve(projectDir, "tsconfig.json"), {
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

	writeJson(path.resolve(projectDir, "ion.secret.json"), {
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

	write(path.resolve(projectDir, ".gitignore"), `ion.secrets.json
manifest.json
node_modules
dist
`
	);
}
