import { z } from "zod";
import type { SearchDecision, QueryAnalysis } from "../types/index.js";

export const DecideRequestSchema = z.object({
    query: z.string().min(1),
    useModel: z.boolean().optional(),
});

export const BatchDecideRequestSchema = z.object({
    queries: z.array(z.string().min(1)).min(1).max(100),
    useModel: z.boolean().optional(),
});

export const AnalyzeRequestSchema = z.object({
    query: z.string().min(1),
});

export type DecideRequest = z.infer<typeof DecideRequestSchema>;
export type BatchDecideRequest = z.infer<typeof BatchDecideRequestSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export interface DecideResponse {
    success: true;
    data: SearchDecision;
}

export interface BatchDecideResponse {
    success: true;
    data: Array<{ query: string; decision: SearchDecision }>;
}

export interface AnalyzeResponse {
    success: true;
    data: QueryAnalysis;
}

export interface ErrorResponse {
    success: false;
    error: string;
    code: number;
}

export type ApiResponse = DecideResponse | BatchDecideResponse | AnalyzeResponse | ErrorResponse;
