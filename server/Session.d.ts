import { Request, Response } from "express";
export declare class Session {
    readonly req: Request;
    readonly res: Response<any, Record<string, any>>;
    constructor(req: Request, res: Response);
}
