import { describe, it, expect } from "vitest";
import { AutoSearch, createAutoSearch, shouldSearch } from "../src/index.js";

describe("AutoSearch", () => {
    describe("heuristics-only mode", () => {
        const searcher = new AutoSearch({ useModel: false });

        describe("should NOT search", () => {
            const noSearchCases = [
                "hello",
                "hi there, how are you",
                "thank you for your help",
                "write me a python function to sort a list",
                "what is 15 * 23",
                "solve x^2 + 5x + 6 = 0",
                "write a poem about the ocean",
                "create a story about a hero",
                "what do you think about AI",
                "should i learn rust or go",
                "who are you",
                "what can you do",
                "explain quantum computing to me",
                "what is the capital of france",
                "who invented the telephone",
                "how does photosynthesis work",
                "define entropy",
                "what is the pythagorean theorem",
                "help me debug this code",
                "refactor this function",
            ];

            noSearchCases.forEach((query) => {
                it(`"${query.substring(0, 40)}..." -> no search`, async () => {
                    const decision = await searcher.decide(query);
                    expect(decision.shouldSearch).toBe(false);
                });
            });
        });

        describe("should search", () => {
            const searchCases = [
                "what is the weather today in new york",
                "latest news about openai",
                "current bitcoin price",
                "who won the game yesterday",
                "stock market update",
                "breaking news",
                "what is happening in ukraine right now",
                "current election polls",
                "today's headlines",
            ];

            searchCases.forEach((query) => {
                it(`"${query.substring(0, 40)}..." -> search`, async () => {
                    const decision = await searcher.decide(query);
                    expect(decision.shouldSearch).toBe(true);
                });
            });
        });
    });

    describe("analyze", () => {
        const searcher = createAutoSearch({ useModel: false });

        it("returns query analysis", () => {
            const analysis = searcher.analyze("what is the current stock price");
            expect(analysis.query).toBe("what is the current stock price");
            expect(analysis.hasCurrentEventIndicator).toBe(true);
            expect(analysis.isFactualQuestion).toBe(true);
        });
    });

    describe("getHeuristicScore", () => {
        const searcher = createAutoSearch({ useModel: false });

        it("returns high score for realtime queries", () => {
            const score = searcher.getHeuristicScore("breaking news today");
            expect(score).toBeGreaterThan(0.7);
        });

        it("returns low score for code queries", () => {
            const score = searcher.getHeuristicScore("write typescript code");
            expect(score).toBeLessThan(0.4);
        });
    });

    describe("getCategory", () => {
        const searcher = createAutoSearch({ useModel: false });

        it("categorizes code queries", () => {
            expect(searcher.getCategory("write a function")).toBe("code");
        });

        it("categorizes math queries", () => {
            expect(searcher.getCategory("calculate 5 + 3")).toBe("math");
        });

        it("categorizes creative queries", () => {
            expect(searcher.getCategory("write a poem")).toBe("creative");
        });
    });
});

describe("shouldSearch helper", () => {
    it("returns boolean directly", async () => {
        const result = await shouldSearch("write code", { useModel: false });
        expect(typeof result).toBe("boolean");
        expect(result).toBe(false);
    });

    it("returns true for realtime queries", async () => {
        const result = await shouldSearch("current stock price", { useModel: false });
        expect(result).toBe(true);
    });
});

describe("edge cases", () => {
    const searcher = createAutoSearch({ useModel: false });

    it("handles empty string", async () => {
        const decision = await searcher.decide("");
        expect(decision).toBeDefined();
        expect(typeof decision.shouldSearch).toBe("boolean");
    });

    it("handles unicode", async () => {
        const decision = await searcher.decide("今天的天气怎么样");
        expect(decision).toBeDefined();
    });

    it("handles special characters", async () => {
        const decision = await searcher.decide("what is @#$% happening???");
        expect(decision).toBeDefined();
    });

    it("handles very long input", async () => {
        const longQuery = "what is ".repeat(500);
        const decision = await searcher.decide(longQuery);
        expect(decision).toBeDefined();
    });
});
