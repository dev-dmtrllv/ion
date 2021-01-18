import fs from "fs";
import path from "path";


export const updateApiDefinition = (globalDTS: string, newApiEntryPath: string | undefined) =>
{
	let dts = fs.readFileSync(globalDTS, "utf-8");
	const regex = /^(type ApiTree = typeof import\(")(.*)("\);)$/gi;

	if (newApiEntryPath === undefined) // remove the api definition
	{
		dts.replace(regex, "");
	}
	else
	{
		if (regex.test(dts))
		{
			newApiEntryPath = newApiEntryPath.endsWith("index") ? newApiEntryPath : path.join(newApiEntryPath, "index");
			dts.replace(regex, `type ApiTree = typeof import("${newApiEntryPath}");`);
		}
		else
		{
			dts += `\r\n type ApiTree = typeof import("${newApiEntryPath}");`;
		}
	}
	fs.writeFileSync(globalDTS, dts, "utf-8");
}
