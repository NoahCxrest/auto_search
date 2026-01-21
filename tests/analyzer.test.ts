import { describe, it, expect } from "vitest";
import { analyzeQuery } from "../src/core/analyzer.js";

describe("analyzeQuery", () => {
    describe("temporal detection", () => {
        it("detects today", () => {
            const result = analyzeQuery("what happened today");
            expect(result.hasTemporalIndicator).toBe(true);
        });

        it("detects current year", () => {
            const result = analyzeQuery("best movies of 2025");
            expect(result.hasTemporalIndicator).toBe(true);
        });

        it("does not flag static queries", () => {
            const result = analyzeQuery("what is the capital of france");
            expect(result.hasTemporalIndicator).toBe(false);
        });
    });

    describe("current event detection", () => {
        it("detects news queries", () => {
            const result = analyzeQuery("latest news about AI");
            expect(result.hasCurrentEventIndicator).toBe(true);
        });

        it("detects stock queries", () => {
            const result = analyzeQuery("what is apple stock price");
            expect(result.hasCurrentEventIndicator).toBe(true);
        });

        it("detects weather queries", () => {
            const result = analyzeQuery("weather in new york");
            expect(result.hasCurrentEventIndicator).toBe(true);
        });
    });

    describe("category detection", () => {
        it("detects code related", () => {
            const result = analyzeQuery("write a python function to sort a list");
            expect(result.isCodeRelated).toBe(true);
        });

        it("detects math related", () => {
            const result = analyzeQuery("calculate 15 * 23");
            expect(result.isMathRelated).toBe(true);
        });

        it("detects creative requests", () => {
            const result = analyzeQuery("write me a poem about love");
            expect(result.isCreativeRequest).toBe(true);
        });

        it("detects opinion based", () => {
            const result = analyzeQuery("what do you think about typescript");
            expect(result.isOpinionBased).toBe(true);
        });

        it("detects personal questions", () => {
            const result = analyzeQuery("who are you");
            expect(result.isPersonalQuestion).toBe(true);
        });
    });

    describe("factual detection", () => {
        it("detects factual questions", () => {
            const result = analyzeQuery("what is the speed of light?");
            expect(result.isFactualQuestion).toBe(true);
        });

        it("detects questions without question mark", () => {
            const result = analyzeQuery("what is quantum computing");
            expect(result.isFactualQuestion).toBe(true);
        });
    });

    describe("realtime data requirement", () => {
        it("requires realtime for current events", () => {
            const result = analyzeQuery("who won the game today");
            expect(result.requiresRealtimeData).toBe(true);
        });

        it("does not require realtime for static knowledge", () => {
            const result = analyzeQuery("who invented the telephone");
            expect(result.requiresRealtimeData).toBe(false);
        });
    });
});
