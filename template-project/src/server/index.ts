import { Server } from "ion/server";

export default class extends Server
{
	public onListening()
	{
		console.log(`server listening on http://${this.host}:${this.port}`);
	}
}
