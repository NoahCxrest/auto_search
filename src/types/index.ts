import { z } from "zod";

export const SearchDecisionSchema = z.object({
    shouldSearch: z.boolean(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    category: z.enum([
        "factual_current",
        "factual_static",
        "opinion",
        "creative",
        "code",
        "math",
        "personal",
        "ambiguous"
    ]),
});

export type SearchDecision = z.infer<typeof SearchDecisionSchema>;

export interface QueryAnalysis {
    readonly query: string;
    readonly normalizedQuery: string;
    readonly tokens: readonly string[];
    readonly hasTemporalIndicator: boolean;
    readonly hasCurrentEventIndicator: boolean;
    readonly isFactualQuestion: boolean;
    readonly isOpinionBased: boolean;
    readonly isCreativeRequest: boolean;
    readonly isCodeRelated: boolean;
    readonly isMathRelated: boolean;
    readonly isPersonalQuestion: boolean;
    readonly requiresRealtimeData: boolean;
}

export interface SearchConfig {
    readonly ollamaHost: string;
    readonly ollamaModel: string;
    readonly confidenceThreshold: number;
    readonly maxRetries: number;
    readonly timeoutMs: number;
}

export interface SearchDecider {
    readonly decide: (query: string) => Promise<SearchDecision>;
    readonly analyze: (query: string) => QueryAnalysis;
}

export type DecisionCategory = SearchDecision["category"];

export interface HeuristicResult {
    readonly score: number;
    readonly signals: readonly string[];
}

export interface ModelResponse {
    readonly raw: string;
    readonly parsed: SearchDecision | null;
}
