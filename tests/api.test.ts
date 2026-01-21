import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApiServer } from "../src/api/server.js";
import type { Server } from "node:http";

const PORT = 3456;
const BASE = `http://localhost:${PORT}`;

describe("api server", () => {
    let server: { start: () => Server; stop: () => Promise<void> };

    beforeAll(() => {
        server = createApiServer(PORT);
        server.start();
    });

    afterAll(async () => {
        await server.stop();
    });

    describe("GET /", () => {
        it("returns api info", async () => {
            const res = await fetch(`${BASE}/`);
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.name).toBe("auto-search");
            expect(data.endpoints).toContain("/decide");
        });
    });

    describe("GET /health", () => {
        it("returns health status", async () => {
            const res = await fetch(`${BASE}/health`);
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.status).toBe("ok");
            expect(data.timestamp).toBeDefined();
        });
    });

    describe("POST /decide", () => {
        it("returns decision for valid query", async () => {
            const res = await fetch(`${BASE}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "what is the weather today" }),
            });
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.shouldSearch).toBe(true);
            expect(data.data.category).toBe("factual_current");
        });

        it("returns no search for code query", async () => {
            const res = await fetch(`${BASE}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "write a python function" }),
            });
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.shouldSearch).toBe(false);
            expect(data.data.category).toBe("code");
        });

        it("returns 400 for empty query", async () => {
            const res = await fetch(`${BASE}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "" }),
            });
            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.success).toBe(false);
        });

        it("returns 400 for missing query", async () => {
            const res = await fetch(`${BASE}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /batch", () => {
        it("processes multiple queries", async () => {
            const queries = ["current news", "write code", "hello"];
            const res = await fetch(`${BASE}/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ queries }),
            });
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(3);
            expect(data.data[0].decision.shouldSearch).toBe(true);
            expect(data.data[1].decision.shouldSearch).toBe(false);
            expect(data.data[2].decision.shouldSearch).toBe(false);
        });

        it("returns 400 for empty queries array", async () => {
            const res = await fetch(`${BASE}/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ queries: [] }),
            });
            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe("POST /analyze", () => {
        it("returns query analysis", async () => {
            const res = await fetch(`${BASE}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "latest stock prices today" }),
            });
            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.hasTemporalIndicator).toBe(true);
            expect(data.data.hasCurrentEventIndicator).toBe(true);
            expect(data.data.requiresRealtimeData).toBe(true);
        });
    });

    describe("404 handling", () => {
        it("returns 404 for unknown route", async () => {
            const res = await fetch(`${BASE}/nonexistent`);
            const data = await res.json();
            expect(res.status).toBe(404);
            expect(data.success).toBe(false);
        });
    });

    describe("CORS", () => {
        it("handles OPTIONS preflight", async () => {
            const res = await fetch(`${BASE}/decide`, { method: "OPTIONS" });
            expect(res.status).toBe(204);
            expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
        });
    });
});
