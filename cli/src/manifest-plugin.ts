import webpack from "webpack";

export class ManifestPlugin
{
	public static readonly ID = "Ion_ManifestPlugin";

	public readonly props: ManifestPluginProps;

	constructor(props: ManifestPluginProps)
	{
		this.props = props;
	}

	private transformPath = (p) =>
	{
		if (p.startsWith("."))
			return p.substr(1, p.length);
		else if (!p.startsWith("/"))
			return "/" + p;
		else
			return p;
	}

	public apply = (compiler: webpack.Compiler) =>
	{
		compiler.hooks.emit.tapAsync(ManifestPlugin.ID, (c, cb) =>
		{
			const manifest = {
				main: {},
				chunks: {}
			};

			for (const { files, name, id } of c.chunks)
			{
				if (name)
				{
					const _files: any = [];
					files.forEach((k, val) => _files.push(this.transformPath(val)));
					manifest.main[name] = {
						id,
						files: _files
					};
				}
			}

			for (const { chunks, origins } of c.chunkGroups)
			{
				const origin = origins && origins[0];
				if (origin)
				{
					const fileName = origin.request;
					if (fileName && !fileName.includes("node_modules\\.gen") && !fileName.includes("node_modules/.gen"))
					{
						for (const { id, files } of chunks)
						{
							const _files: any = [];
							files.forEach((k, val) => _files.push(this.transformPath(val)));
							manifest.chunks[fileName] = {
								id,
								files: _files
							};
						}
					}
				}
			}
			this.props.onManifest(manifest);
			cb();
		});
	}
}

type ManifestPluginProps = {
	onManifest: (manifest: object) => any;
};
