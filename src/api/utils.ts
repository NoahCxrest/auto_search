import type { IncomingMessage, ServerResponse } from "node:http";
import type { ErrorResponse } from "./types.js";

export const json = <T>(res: ServerResponse, status: number, data: T): void => {
    res.writeHead(status, { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end(JSON.stringify(data));
};

export const error = (res: ServerResponse, status: number, message: string): void => {
    const payload: ErrorResponse = { success: false, error: message, code: status };
    json(res, status, payload);
};

export const parseBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }
    const body = Buffer.concat(chunks).toString();
    if (!body) return {};
    return JSON.parse(body);
};

export const getPath = (url: string | undefined): string => {
    if (!url) return "/";
    const parsed = new URL(url, "http://localhost");
    return parsed.pathname;
};
