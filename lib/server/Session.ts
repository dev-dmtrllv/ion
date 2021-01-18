import { Request, Response } from "express";

export class Session
{
	public readonly req: Request;
	public readonly res: Response<any, Record<string, any>>;

	public constructor(req: Request, res: Response)
	{
		this.req = req;
		this.res = res;
	}
}
