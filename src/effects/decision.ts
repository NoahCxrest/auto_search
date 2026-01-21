import { Effect, pipe, Schedule, Duration } from "effect";
import type { SearchConfig, SearchDecision, QueryAnalysis } from "../types/index.js";
import { analyzeQuery, computeHeuristic, inferCategory } from "../core/index.js";
import { createOllamaClient, queryModelWithTimeout } from "../providers/index.js";
import type { Ollama } from "ollama";

export class SearchDecisionError extends Error {
    readonly _tag = "SearchDecisionError";
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
    }
}

export class ModelTimeoutError extends Error {
    readonly _tag = "ModelTimeoutError";
    constructor(public readonly timeoutMs: number) {
        super(`model request timed out after ${timeoutMs}ms`);
    }
}

export class ModelParseError extends Error {
    readonly _tag = "ModelParseError";
    constructor(public readonly raw: string) {
        super("failed to parse model response");
    }
}

type DecisionError = SearchDecisionError | ModelTimeoutError | ModelParseError;

const makeHeuristicDecision = (analysis: QueryAnalysis, threshold: number): SearchDecision => {
    const heuristic = computeHeuristic(analysis);
    const category = inferCategory(analysis);
  
    return {
        shouldSearch: heuristic.score >= threshold,
        confidence: Math.abs(heuristic.score - 0.5) * 2,
        reasoning: `heuristic signals: ${heuristic.signals.join(", ") || "none"}`,
        category,
    };
};

const queryModelEffect = (
    client: Ollama,
    config: SearchConfig,
    query: string
): Effect.Effect<SearchDecision, DecisionError> =>
    pipe(
        Effect.tryPromise({
            try: () => queryModelWithTimeout(client, config, query),
            catch: (e) => new SearchDecisionError("model query failed", e),
        }),
        Effect.flatMap((response) =>
            response.parsed
                ? Effect.succeed(response.parsed)
                : Effect.fail(new ModelParseError(response.raw))
        )
    );

const withRetry = <A, E>(
    effect: Effect.Effect<A, E>,
    maxRetries: number
): Effect.Effect<A, E> =>
    pipe(
        effect,
        Effect.retry(
            Schedule.recurs(maxRetries - 1).pipe(
                Schedule.intersect(Schedule.exponential(Duration.millis(100)))
            )
        )
    );

export const decideWithModel = (
    config: SearchConfig,
    query: string
): Effect.Effect<SearchDecision, DecisionError> => {
    const client = createOllamaClient(config);
    return withRetry(queryModelEffect(client, config, query), config.maxRetries);
};

export const decideWithHeuristics = (
    config: SearchConfig,
    query: string
): Effect.Effect<SearchDecision, never> => {
    const analysis = analyzeQuery(query);
    return Effect.succeed(makeHeuristicDecision(analysis, config.confidenceThreshold));
};

export const decideHybrid = (
    config: SearchConfig,
    query: string
): Effect.Effect<SearchDecision, never> => {
    const analysis = analyzeQuery(query);
    const heuristic = computeHeuristic(analysis);
  
    const veryConfidentThreshold = 1 - config.confidenceThreshold;
    if (heuristic.score <= veryConfidentThreshold || heuristic.score >= config.confidenceThreshold) {
        return decideWithHeuristics(config, query);
    }
  
    return pipe(
        decideWithModel(config, query),
        Effect.catchAll(() => decideWithHeuristics(config, query))
    );
};

export const runDecision = async (
    effect: Effect.Effect<SearchDecision, DecisionError>
): Promise<SearchDecision> => Effect.runPromise(effect);
