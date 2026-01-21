import type { QueryAnalysis } from "../types/index.js";
import { patterns, matchesAny, containsTemporal } from "./patterns.js";

const tokenize = (text: string): string[] =>
    text.toLowerCase().split(/\s+/).filter(Boolean);

const normalize = (text: string): string =>
    text.toLowerCase().trim().replace(/\s+/g, " ");

export const analyzeQuery = (query: string): QueryAnalysis => {
    const normalizedQuery = normalize(query);
    const tokens = tokenize(normalizedQuery);

    const hasTemporalIndicator = containsTemporal(normalizedQuery);
    const hasCurrentEventIndicator = matchesAny(normalizedQuery, patterns.currentEvent);
    const isFactualQuestion = normalizedQuery.includes("?") || 
        /^(what|who|when|where|why|how|which|is|are|was|were|do|does|did|can|could|will|would)\b/i.test(normalizedQuery);
    const isOpinionBased = matchesAny(normalizedQuery, patterns.opinion);
    const isCreativeRequest = matchesAny(normalizedQuery, patterns.creative);
    const isCodeRelated = matchesAny(normalizedQuery, patterns.code);
    const isMathRelated = matchesAny(normalizedQuery, patterns.math);
    const isPersonalQuestion = matchesAny(normalizedQuery, patterns.personal);
    const requiresRealtimeData = hasCurrentEventIndicator || 
        (hasTemporalIndicator && isFactualQuestion && !matchesAny(normalizedQuery, patterns.staticKnowledge));

    return {
        query,
        normalizedQuery,
        tokens,
        hasTemporalIndicator,
        hasCurrentEventIndicator,
        isFactualQuestion,
        isOpinionBased,
        isCreativeRequest,
        isCodeRelated,
        isMathRelated,
        isPersonalQuestion,
        requiresRealtimeData,
    };
};
