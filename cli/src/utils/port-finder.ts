import net from "net";

const isPortAvailable = (port: number) => new Promise(res => 
{
	const tester = net.createServer().once("error", (err: any) => res(err.code == "EADDRINUSE")).once("listening", () => 
	{
		tester.once("close", () => res(true)).close();
	}).listen(port);
});

export const findAvailablePort = async (port: number) =>
{
	let isAvailable = await isPortAvailable(port);
	while(!isAvailable)
	{
		port++;
		isAvailable = await isPortAvailable(port);
	}
	return port;
}
