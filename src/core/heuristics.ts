import type { QueryAnalysis, HeuristicResult, DecisionCategory } from "../types/index.js";
import { patterns, matchesAny } from "./patterns.js";

const WEIGHTS = {
    temporalIndicator: 0.25,
    currentEventIndicator: 0.35,
    realtimeData: 0.4,
    factualQuestion: 0.15,
    staticKnowledge: -0.3,
    opinionBased: -0.25,
    creativeRequest: -0.35,
    codeRelated: -0.3,
    mathRelated: -0.35,
    personalQuestion: -0.4,
    noSearchNeeded: -0.5,
} as const;

export const computeHeuristic = (analysis: QueryAnalysis): HeuristicResult => {
    let score = 0.5;
    const signals: string[] = [];

    if (analysis.hasTemporalIndicator) {
        score += WEIGHTS.temporalIndicator;
        signals.push("temporal");
    }

    if (analysis.hasCurrentEventIndicator) {
        score += WEIGHTS.currentEventIndicator;
        signals.push("current_event");
    }

    if (analysis.requiresRealtimeData) {
        score += WEIGHTS.realtimeData;
        signals.push("realtime");
    }

    if (analysis.isFactualQuestion) {
        score += WEIGHTS.factualQuestion;
        signals.push("factual");
    }

    if (matchesAny(analysis.normalizedQuery, patterns.staticKnowledge)) {
        score += WEIGHTS.staticKnowledge;
        signals.push("static_knowledge");
    }

    if (analysis.isOpinionBased) {
        score += WEIGHTS.opinionBased;
        signals.push("opinion");
    }

    if (analysis.isCreativeRequest) {
        score += WEIGHTS.creativeRequest;
        signals.push("creative");
    }

    if (analysis.isCodeRelated) {
        score += WEIGHTS.codeRelated;
        signals.push("code");
    }

    if (analysis.isMathRelated) {
        score += WEIGHTS.mathRelated;
        signals.push("math");
    }

    if (analysis.isPersonalQuestion) {
        score += WEIGHTS.personalQuestion;
        signals.push("personal");
    }

    if (matchesAny(analysis.normalizedQuery, patterns.noSearchNeeded)) {
        score += WEIGHTS.noSearchNeeded;
        signals.push("greeting_or_help");
    }

    return {
        score: Math.max(0, Math.min(1, score)),
        signals,
    };
};

export const inferCategory = (analysis: QueryAnalysis): DecisionCategory => {
    if (analysis.isCodeRelated) return "code";
    if (analysis.isMathRelated) return "math";
    if (analysis.isCreativeRequest) return "creative";
    if (analysis.isOpinionBased) return "opinion";
    if (analysis.isPersonalQuestion) return "personal";
    if (analysis.requiresRealtimeData || analysis.hasCurrentEventIndicator) return "factual_current";
    if (matchesAny(analysis.normalizedQuery, patterns.staticKnowledge)) return "factual_static";
    return "ambiguous";
};
