import path from "path";
import fs from "fs";
import { getFilesRecursive } from "../utils";

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
}
