import io from "socket.io-client";

const socket = io("http://localhost:3002", {
	forceNew: true,
	autoConnect: true,
	reconnection: true,
});

socket.on("reload", () => window.location.reload());
