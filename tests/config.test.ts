import { describe, it, expect } from "vitest";
import { createConfig, loadConfig } from "../src/config/index.js";

describe("config", () => {
    describe("loadConfig", () => {
        it("returns default values when no env vars set", () => {
            const config = loadConfig();
            expect(config.ollamaHost).toBe("http://localhost:11434");
            expect(config.ollamaModel).toBe("qwen2.5vl:3b");
            expect(config.confidenceThreshold).toBe(0.7);
            expect(config.maxRetries).toBe(3);
            expect(config.timeoutMs).toBe(30000);
        });
    });

    describe("createConfig", () => {
        it("merges overrides with defaults", () => {
            const config = createConfig({
                ollamaModel: "llama3",
                confidenceThreshold: 0.9,
            });
            expect(config.ollamaModel).toBe("llama3");
            expect(config.confidenceThreshold).toBe(0.9);
            expect(config.ollamaHost).toBe("http://localhost:11434");
        });

        it("allows full override", () => {
            const config = createConfig({
                ollamaHost: "http://custom:1234",
                ollamaModel: "custom-model",
                confidenceThreshold: 0.5,
                maxRetries: 5,
                timeoutMs: 60000,
            });
            expect(config.ollamaHost).toBe("http://custom:1234");
            expect(config.ollamaModel).toBe("custom-model");
            expect(config.confidenceThreshold).toBe(0.5);
            expect(config.maxRetries).toBe(5);
            expect(config.timeoutMs).toBe(60000);
        });
    });
});
