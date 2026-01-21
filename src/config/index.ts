import { z } from "zod";
import type { SearchConfig } from "../types/index.js";

const ConfigSchema = z.object({
    ollamaHost: z.string().url().default("http://localhost:11434"),
    ollamaModel: z.string().default("qwen2.5vl:3b"),
    confidenceThreshold: z.number().min(0).max(1).default(0.7),
    maxRetries: z.number().int().positive().default(3),
    timeoutMs: z.number().int().positive().default(30000),
});

export const loadConfig = (): SearchConfig => {
    return ConfigSchema.parse({
        ollamaHost: process.env["OLLAMA_HOST"] ?? "http://localhost:11434",
        ollamaModel: process.env["OLLAMA_MODEL"] ?? "qwen2.5vl:3b",
        confidenceThreshold: parseFloat(process.env["SEARCH_CONFIDENCE_THRESHOLD"] ?? "0.7"),
        maxRetries: parseInt(process.env["MAX_RETRIES"] ?? "3", 10),
        timeoutMs: parseInt(process.env["REQUEST_TIMEOUT_MS"] ?? "30000", 10),
    });
};

export const createConfig = (overrides: Partial<SearchConfig> = {}): SearchConfig => {
    const base = loadConfig();
    return { ...base, ...overrides };
};
