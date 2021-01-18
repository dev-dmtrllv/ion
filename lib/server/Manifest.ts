export class Manifest
{

	private readonly data: ManifestData;

	public readonly runtime: {
		scripts: string[];
		styles: string[];
	};

	public constructor(data: ManifestData)
	{
		this.data = data;
		this.runtime = {
			scripts: [...this.getTargetedFiles("main", "runtime", "js"), ...this.getTargetedFiles("main", "vendor", "js")],
			styles: [...this.getTargetedFiles("main", "runtime", "css"), ...this.getTargetedFiles("main", "vendor", "css")],
		};
	}

	private readonly getTargetedFiles = (target: "main" | "chunks", chunkName: string, type: "css" | "js"): any => (this.data[target][chunkName]?.files.filter(s => s.endsWith(type)) || []);

	public readonly getChunkFiles = (chunkIDs: string[]) =>
	{
		const data: {
			scripts: string[];
			styles: string[];
		} = {
			styles: [],
			scripts: [],
		};

		chunkIDs.forEach(path => 
		{
			path = path.replace(/.tsx?/, "");
			if (this.data.chunks[path])
			{
				data.scripts.push(...this.getTargetedFiles("chunks", path, "js"));
				data.styles.push(...this.getTargetedFiles("chunks", path, "css"));
			}
		});

		return data;
	}

	public readonly getAppFiles = (name: string,) =>
	{
		return {
			scripts: [...this.getTargetedFiles("main", name, "js")],
			styles: [...this.getTargetedFiles("main", name, "css")],
		}
	}
}

type ManifestData = {
	main: {
		"runtime": ChunkData | undefined;
		"vendor": ChunkData | undefined;
		[key: string]: ChunkData | undefined;
	};
	chunks: {
		[key: string]: ChunkData;
	}
};

type ChunkData = {
	id: string;
	files: string[];
};
