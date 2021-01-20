import { ClientCompiler } from "../client-compiler";
import { IonConfig } from "../config/ion-config";
import { ICommand } from "./icommand";
import { Server } from "../server";
import io from "socket.io"
import http from "http"
import express from "express";
import cors from "cors";
import { equals } from "../utils/equals";

let ionConfig: IonConfig;
let clientCompiler: ClientCompiler;
let server: Server;

const socketApp = express();
const socketServer = http.createServer(socketApp);

socketApp.use(cors());

const socket = new io.Server(socketServer, {
	cors: {
		credentials: false,
		methods: ["GET", "POST", "PUT", "DELETE"],
		origin: "http://localhost:3001"
	}
});

socketServer.listen(3002, "localhost");
socketApp.listen()

const sendReloadMessage = () =>
{
	socket.emit("reload");
}

const start: ICommand = async (cwd, ...args) =>
{
	ionConfig = IonConfig.fromPath(cwd);

	clientCompiler = new ClientCompiler(cwd, ionConfig, true);

	server = new Server(cwd, ionConfig);

	await clientCompiler.watch(() => 
	{
		server.updateApp();
		sendReloadMessage();
	});

	ionConfig.watch(async (old) => 
	{
		console.log(old, ionConfig);

		if(!equals(old.apps, ionConfig.apps))
		{
			await clientCompiler.close();
			clientCompiler = new ClientCompiler(cwd, ionConfig, true);
			await clientCompiler.watch(() => server.updateApp());
			await server.start(true);
			sendReloadMessage();
		}
		else if(!equals(old.server, ionConfig.server) || !equals(old.database, ionConfig.database))
		{
			await server.start(true);
			sendReloadMessage();
		}
	});
		
	server.watch(() => { console.log("server change"); sendReloadMessage(); });

	await server.start();
}

export default start;
