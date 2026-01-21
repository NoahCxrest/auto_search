import { describe, it, expect } from "vitest";
import { computeHeuristic, inferCategory } from "../src/core/heuristics.js";
import { analyzeQuery } from "../src/core/analyzer.js";

describe("computeHeuristic", () => {
    describe("should search (high scores)", () => {
        it("scores high for current events", () => {
            const analysis = analyzeQuery("what is happening in the stock market today");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThan(0.7);
            expect(result.signals).toContain("current_event");
        });

        it("scores high for weather queries", () => {
            const analysis = analyzeQuery("what is the weather forecast for tomorrow");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThan(0.6);
        });

        it("scores high for news queries", () => {
            const analysis = analyzeQuery("latest breaking news");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThan(0.7);
        });
    });

    describe("should not search (low scores)", () => {
        it("scores low for code requests", () => {
            const analysis = analyzeQuery("write a typescript function to validate email");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.4);
            expect(result.signals).toContain("code");
        });

        it("scores low for math problems", () => {
            const analysis = analyzeQuery("solve 2x + 5 = 15");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.4);
            expect(result.signals).toContain("math");
        });

        it("scores low for creative writing", () => {
            const analysis = analyzeQuery("write a short story about a dragon");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.4);
            expect(result.signals).toContain("creative");
        });

        it("scores low for opinion questions", () => {
            const analysis = analyzeQuery("what do you think is the best programming language");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.5);
            expect(result.signals).toContain("opinion");
        });

        it("scores low for personal questions", () => {
            const analysis = analyzeQuery("who are you and what can you do");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.4);
            expect(result.signals).toContain("personal");
        });

        it("scores low for greetings", () => {
            const analysis = analyzeQuery("hello how are you");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.3);
        });

        it("scores low for static knowledge", () => {
            const analysis = analyzeQuery("what is the capital of france");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.5);
        });

        it("scores low for historical facts", () => {
            const analysis = analyzeQuery("who invented the light bulb");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeLessThan(0.4);
        });
    });

    describe("edge cases", () => {
        it("handles empty string", () => {
            const analysis = analyzeQuery("");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(1);
        });

        it("handles very long queries", () => {
            const longQuery = "tell me about " + "the ".repeat(100) + "thing";
            const analysis = analyzeQuery(longQuery);
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(1);
        });

        it("clamps score between 0 and 1", () => {
            const analysis = analyzeQuery("hello hi hey good morning thanks thank you help");
            const result = computeHeuristic(analysis);
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(1);
        });
    });
});

describe("inferCategory", () => {
    it("returns code for programming queries", () => {
        const analysis = analyzeQuery("write a javascript function");
        expect(inferCategory(analysis)).toBe("code");
    });

    it("returns math for calculations", () => {
        const analysis = analyzeQuery("calculate the derivative of x^2");
        expect(inferCategory(analysis)).toBe("math");
    });

    it("returns creative for writing requests", () => {
        const analysis = analyzeQuery("compose a poem");
        expect(inferCategory(analysis)).toBe("creative");
    });

    it("returns opinion for subjective questions", () => {
        const analysis = analyzeQuery("what is the best way to learn");
        expect(inferCategory(analysis)).toBe("opinion");
    });

    it("returns personal for self-referential queries", () => {
        const analysis = analyzeQuery("are you an ai");
        expect(inferCategory(analysis)).toBe("personal");
    });

    it("returns factual_current for realtime queries", () => {
        const analysis = analyzeQuery("what is the current bitcoin price");
        expect(inferCategory(analysis)).toBe("factual_current");
    });

    it("returns factual_static for historical queries", () => {
        const analysis = analyzeQuery("what is the definition of democracy");
        expect(inferCategory(analysis)).toBe("factual_static");
    });

    it("returns ambiguous for unclear queries", () => {
        const analysis = analyzeQuery("blue");
        expect(inferCategory(analysis)).toBe("ambiguous");
    });
});
