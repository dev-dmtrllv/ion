import fs from "fs";
import path from "path";

export const write = (filePath: string, data: string) =>
{
	const fileName = path.basename(filePath);
	const dir = filePath.substr(0, filePath.length - (fileName.length + 1));
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(filePath, data, "utf-8");
}

export const writeJson = (filePath: string, data: Object) => write(filePath, JSON.stringify(data, null, 4));

export const getFilesRecursive = (dir: string, foundDirs: string[] = []) => 
{
	fs.readdirSync(dir, "utf-8").forEach((p) => 
	{
		p = path.resolve(dir, p);
		if(fs.statSync(p).isDirectory())
		{
			getFilesRecursive(p, foundDirs);
		}
		else
		{
			foundDirs.push(p);
		}
	});

	return foundDirs;
}
