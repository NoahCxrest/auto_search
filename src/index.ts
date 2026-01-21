import type { SearchDecision, SearchDecider, SearchConfig, QueryAnalysis } from "./types/index.js";
import { createConfig } from "./config/index.js";
import { analyzeQuery, computeHeuristic, inferCategory } from "./core/index.js";
import { decideHybrid, decideWithHeuristics, runDecision } from "./effects/index.js";

export interface AutoSearchOptions {
    readonly useModel?: boolean;
    readonly config?: Partial<SearchConfig>;
}

export class AutoSearch implements SearchDecider {
    private readonly config: SearchConfig;
    private readonly useModel: boolean;

    constructor(options: AutoSearchOptions = {}) {
        this.config = createConfig(options.config);
        this.useModel = options.useModel ?? true;
    }

    async decide(query: string): Promise<SearchDecision> {
        const effect = this.useModel
            ? decideHybrid(this.config, query)
            : decideWithHeuristics(this.config, query);
    
        return runDecision(effect);
    }

    analyze(query: string): QueryAnalysis {
        return analyzeQuery(query);
    }

    getHeuristicScore(query: string): number {
        const analysis = analyzeQuery(query);
        return computeHeuristic(analysis).score;
    }

    getCategory(query: string): SearchDecision["category"] {
        const analysis = analyzeQuery(query);
        return inferCategory(analysis);
    }
}

export const createAutoSearch = (options?: AutoSearchOptions): AutoSearch =>
    new AutoSearch(options);

// quick one-liner for simple use
export const shouldSearch = async (
    query: string,
    options?: AutoSearchOptions
): Promise<boolean> => {
    const searcher = createAutoSearch(options);
    const decision = await searcher.decide(query);
    return decision.shouldSearch;
};

export * from "./types/index.js";
export * from "./config/index.js";
export * from "./core/index.js";
export * from "./effects/index.js";
export * from "./providers/index.js";
export * from "./api/index.js";
