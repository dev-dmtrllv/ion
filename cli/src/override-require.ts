import path from "path";
import Module from "module";

let isOverridden = false;

export const overrideRequire = () =>
{
	if (isOverridden)
		return;

	isOverridden = true;

	const cssExtensions = [
		".css",
		".sass",
		".scss",
		".less",
	];

	const imageExtensions = [
		".jpg",
		".jpeg",
		".gif",
		".png",
		".svg",
	];

	cssExtensions.forEach(i => require.extensions[i] = () => { })

	var originalRequire = Module.prototype.require;

	(Module as any).prototype.require = function ()
	{
		const name = arguments["0"]
		for (const e of imageExtensions)
			if (name.endsWith(e))
				return "/" + path.join("images", path.basename(name)).replace(/\\/g, "/");
		return originalRequire.apply(this, arguments);
	};
}
