import { Ollama } from "ollama";
import type { SearchConfig, SearchDecision, ModelResponse } from "../types/index.js";
import { SearchDecisionSchema } from "../types/index.js";

const SYSTEM_PROMPT = `you are a search decision classifier. given a user query, determine if web search is needed.

respond ONLY with valid json:
{"shouldSearch":boolean,"confidence":number,"reasoning":"string","category":"factual_current|factual_static|opinion|creative|code|math|personal|ambiguous"}

rules:
- shouldSearch=true ONLY for queries requiring current/real-time information
- shouldSearch=false for: coding, math, creative writing, opinions, general knowledge, greetings
- confidence: 0-1, how certain you are
- be extremely conservative - when in doubt, don't search
- if the model can answer from training data, no search needed`;

// this prompt is tighter than my code reviews
const buildUserPrompt = (query: string): string =>
    `classify this query (json only, no explanation):\n"${query}"`;

export const createOllamaClient = (config: SearchConfig): Ollama =>
    new Ollama({ host: config.ollamaHost });

const parseModelResponse = (raw: string): SearchDecision | null => {
    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
    
        const parsed = JSON.parse(jsonMatch[0]);
        return SearchDecisionSchema.parse(parsed);
    } catch {
        return null;
    }
};

export const queryModel = async (
    client: Ollama,
    config: SearchConfig,
    query: string
): Promise<ModelResponse> => {
    const response = await client.chat({
        model: config.ollamaModel,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(query) },
        ],
        options: {
            temperature: 0.1,
            num_predict: 256,
        },
    });

    const raw = response.message.content;
    return {
        raw,
        parsed: parseModelResponse(raw),
    };
};

export const queryModelWithTimeout = async (
    client: Ollama,
    config: SearchConfig,
    query: string
): Promise<ModelResponse> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
        const response = await client.chat({
            model: config.ollamaModel,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: buildUserPrompt(query) },
            ],
            options: {
                temperature: 0.1,
                num_predict: 256,
            },
        });

        const raw = response.message.content;
        return { raw, parsed: parseModelResponse(raw) };
    } finally {
        clearTimeout(timeout);
    }
};
