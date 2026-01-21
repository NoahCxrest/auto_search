import type { IncomingMessage, ServerResponse } from "node:http";
import { createConfig } from "../config/index.js";
import { analyzeQuery, computeHeuristic, inferCategory } from "../core/index.js";
import { decideHybrid, runDecision } from "../effects/index.js";
import type { SearchDecision, QueryAnalysis } from "../types/index.js";
import { 
    DecideRequestSchema, 
    BatchDecideRequestSchema, 
    AnalyzeRequestSchema,
    type DecideResponse,
    type BatchDecideResponse,
    type AnalyzeResponse,
} from "./types.js";
import { json, error, parseBody } from "./utils.js";

const config = createConfig();

const decide = async (query: string): Promise<SearchDecision> => {
    const effect = decideHybrid(config, query);
    return runDecision(effect);
};

const analyze = (query: string): QueryAnalysis => analyzeQuery(query);

export const handleDecide = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const body = await parseBody(req);
        const parsed = DecideRequestSchema.safeParse(body);
        
        if (!parsed.success) {
            error(res, 400, `invalid request: ${parsed.error.message}`);
            return;
        }

        const decision = await decide(parsed.data.query);
        const response: DecideResponse = { success: true, data: decision };
        json(res, 200, response);
    } catch (e) {
        error(res, 500, e instanceof Error ? e.message : "internal error");
    }
};

export const handleBatchDecide = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const body = await parseBody(req);
        const parsed = BatchDecideRequestSchema.safeParse(body);
        
        if (!parsed.success) {
            error(res, 400, `invalid request: ${parsed.error.message}`);
            return;
        }

        const results = await Promise.all(
            parsed.data.queries.map(async (query) => ({
                query,
                decision: await decide(query),
            }))
        );

        const response: BatchDecideResponse = { success: true, data: results };
        json(res, 200, response);
    } catch (e) {
        error(res, 500, e instanceof Error ? e.message : "internal error");
    }
};

export const handleAnalyze = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const body = await parseBody(req);
        const parsed = AnalyzeRequestSchema.safeParse(body);
        
        if (!parsed.success) {
            error(res, 400, `invalid request: ${parsed.error.message}`);
            return;
        }

        const analysis = analyze(parsed.data.query);
        const response: AnalyzeResponse = { success: true, data: analysis };
        json(res, 200, response);
    } catch (e) {
        error(res, 500, e instanceof Error ? e.message : "internal error");
    }
};

export const handleHealth = (_req: IncomingMessage, res: ServerResponse): void => {
    json(res, 200, { status: "ok", timestamp: Date.now() });
};
