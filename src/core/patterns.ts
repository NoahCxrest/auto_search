const TEMPORAL_MARKERS = new Set([
   "today", "yesterday", "tomorrow", "now", "current", "currently", "latest",
   "recent", "recently", "this week", "this month", "this year", "right now",
   "at the moment", "presently", "nowadays", "these days", "2024", "2025", "2026"
]);

const CURRENT_EVENT_PATTERNS = [
    /\b(news|headlines|happening|update|updates|breaking)\b/i,
    /\b(stock|stocks|price|prices|market|markets)\b/i,
    /\b(weather|forecast|temperature)\b/i,
    /\b(score|scores|game|match|playing)\b/i,
    /\b(election|vote|voting|poll|polls)\b/i,
    /\bwho (is|are|was|were) (the )?(current|new|latest)\b/i,
    /\bwhat (is|are) .* (doing|happening|going on)\b/i,
];

const STATIC_KNOWLEDGE_PATTERNS = [
    /\b(what is|define|definition|explain|meaning of)\b/i,
    /\b(how does|how do|how to)\b.*\b(work|function|operate)\b/i,
    /\b(history of|origin of|invented|discovered)\b/i,
    /\b(capital of|population of|located in)\b/i,
    /\bwho (invented|discovered|created|founded|wrote)\b/i,
    /\b(formula|equation|theorem|law|principle)\b/i,
];

const OPINION_PATTERNS = [
    /\b(should i|do you think|what do you think|opinion|recommend|suggestion)\b/i,
    /\b(best|worst|favorite|better|worse)\b/i,
    /\b(prefer|preference|advice)\b/i,
];

const CREATIVE_PATTERNS = [
    /\b(write|create|generate|make|compose|draft)\b/i,
    /\b(story|poem|essay|article|script|song|lyrics)\b/i,
    /\b(imagine|pretend|roleplay|act as)\b/i,
];

const CODE_PATTERNS = [
    /\b(code|coding|program|programming|function|class|method)\b/i,
    /\b(javascript|typescript|python|java|rust|golang|c\+\+|ruby)\b/i,
    /\b(debug|error|bug|fix|implement|refactor)\b/i,
    /\b(api|database|server|client|frontend|backend)\b/i,
    /```[\s\S]*```/,
];

const MATH_PATTERNS = [
    /\b(calculate|compute|solve|equation|formula)\b/i,
    /\b(math|mathematics|algebra|calculus|geometry|statistics)\b/i,
    /\d+\s*[\+\-\*\/\^]\s*\d+/,
    /\b(sum|product|derivative|integral|factor|simplify)\b/i,
];

const PERSONAL_PATTERNS = [
    /\b(you|your|yourself)\b/i,
    /\b(are you|can you|do you|will you)\b/i,
    /\bwho are you\b/i,
];

const NO_SEARCH_NEEDED_PATTERNS = [
    /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you)/i,
    /\b(help me understand|explain to me|teach me)\b/i,
    /^what can you do/i,
];

export const patterns = {
    temporal: TEMPORAL_MARKERS,
    currentEvent: CURRENT_EVENT_PATTERNS,
    staticKnowledge: STATIC_KNOWLEDGE_PATTERNS,
    opinion: OPINION_PATTERNS,
    creative: CREATIVE_PATTERNS,
    code: CODE_PATTERNS,
    math: MATH_PATTERNS,
    personal: PERSONAL_PATTERNS,
    noSearchNeeded: NO_SEARCH_NEEDED_PATTERNS,
};

export const matchesAny = (text: string, patterns: readonly RegExp[]): boolean =>
    patterns.some(p => p.test(text));

export const containsTemporal = (text: string): boolean => {
    const lower = text.toLowerCase();
    for (const marker of TEMPORAL_MARKERS) {
        if (lower.includes(marker)) return true;
    }
    return false;
};
