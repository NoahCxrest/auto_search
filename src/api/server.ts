import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { handleDecide, handleBatchDecide, handleAnalyze, handleHealth } from "./handlers.js";
import { json, error, getPath } from "./utils.js";

type Handler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

const routes: Record<string, Record<string, Handler>> = {
    GET: {
        "/health": handleHealth,
        "/": (_req, res) => json(res, 200, { 
            name: "auto-search", 
            version: "1.0.0",
            endpoints: ["/decide", "/batch", "/analyze", "/health"],
        }),
    },
    POST: {
        "/decide": handleDecide,
        "/batch": handleBatchDecide,
        "/analyze": handleAnalyze,
    },
};

const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const method = req.method ?? "GET";
    const path = getPath(req.url);

    if (method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
    }

    const handler = routes[method]?.[path];
    
    if (!handler) {
        error(res, 404, `not found: ${method} ${path}`);
        return;
    }

    await handler(req, res);
};

export const createApiServer = (port = 3000) => {
    const server = createServer((req, res) => {
        handleRequest(req, res).catch((e) => {
            error(res, 500, e instanceof Error ? e.message : "internal error");
        });
    });

    return {
        start: () => {
            server.listen(port, () => {
                console.log(`auto-search api running on http://localhost:${port}`);
            });
            return server;
        },
        stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
        server,
    };
};

export { handleDecide, handleBatchDecide, handleAnalyze, handleHealth } from "./handlers.js";
export * from "./types.js";
